jest.mock("fs/promises", () => ({
    mkdir: jest.fn(),
    unlink: jest.fn(),
    writeFile: jest.fn(),
}));

jest.mock("./mediaRepository", () => ({
    createMedia: jest.fn(),
    deleteMedia: jest.fn(),
    findById: jest.fn(),
    listMedia: jest.fn(),
    updateMedia: jest.fn(),
}));

const fs = require("fs/promises");
const mediaRepository = require("./mediaRepository");
const mediaService = require("./mediaService");

const testEnv = {
    CMS_MEDIA_ALLOWED_TYPES: "image/png,application/pdf",
    CMS_MEDIA_DIR: "uploads/test-cms",
    CMS_MEDIA_MAX_BYTES: "20",
    CMS_MEDIA_PUBLIC_PATH: "/media/test",
};

beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.unlink.mockResolvedValue();
});

describe("mediaService uploads", () => {
    it("stores a validated base64 upload and creates a media record", async () => {
        const payload = {
            altText: "Logo",
            caption: "Site logo",
            data: Buffer.from("hello").toString("base64"),
            mimeType: "image/png",
            originalName: "Logo Image.png",
        };
        const createdMedia = { id: 1, url: "/media/test/file.png" };
        mediaRepository.createMedia.mockResolvedValue(createdMedia);

        await expect(mediaService.uploadMedia(payload, 7, testEnv)).resolves.toEqual(createdMedia);

        expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining("uploads\\test-cms"), { recursive: true });
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining("logo-image.png"),
            Buffer.from("hello")
        );
        expect(mediaRepository.createMedia).toHaveBeenCalledWith(expect.objectContaining({
            altText: "Logo",
            caption: "Site logo",
            mimeType: "image/png",
            originalName: "Logo Image.png",
            size: 5,
            uploadedBy: 7,
            url: expect.stringMatching(/^\/media\/test\//),
        }));
    });

    it("accepts data URL uploads", async () => {
        const payload = {
            data: `data:image/png;base64,${Buffer.from("hello").toString("base64")}`,
            mimeType: "image/png",
            originalName: "image.png",
        };
        mediaRepository.createMedia.mockResolvedValue({ id: 1 });

        await expect(mediaService.uploadMedia(payload, 7, testEnv)).resolves.toEqual({ id: 1 });

        expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), Buffer.from("hello"));
    });

    it("rejects unsupported mime types", async () => {
        const payload = {
            data: Buffer.from("hello").toString("base64"),
            mimeType: "text/html",
            originalName: "page.html",
        };

        await expect(mediaService.uploadMedia(payload, 7, testEnv))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Media type is not allowed." },
            });

        expect(fs.writeFile).not.toHaveBeenCalled();
        expect(mediaRepository.createMedia).not.toHaveBeenCalled();
    });

    it("rejects files above the configured size limit", async () => {
        const payload = {
            data: Buffer.from("this file is too large").toString("base64"),
            mimeType: "image/png",
            originalName: "large.png",
        };

        await expect(mediaService.uploadMedia(payload, 7, testEnv))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Media file is too large." },
            });

        expect(fs.writeFile).not.toHaveBeenCalled();
        expect(mediaRepository.createMedia).not.toHaveBeenCalled();
    });
});

describe("mediaService metadata", () => {
    it("lists media with filters", async () => {
        const media = [{ id: 1, mimeType: "image/png" }];
        mediaRepository.listMedia.mockResolvedValue(media);

        await expect(mediaService.getMedia({ mimeType: "image/png" })).resolves.toEqual(media);

        expect(mediaRepository.listMedia).toHaveBeenCalledWith({ mimeType: "image/png" });
    });

    it("updates media metadata after confirming the record exists", async () => {
        const existingMedia = { id: 1, altText: "Old" };
        const updatedMedia = { id: 1, altText: "New", caption: "Caption" };
        mediaRepository.findById.mockResolvedValue(existingMedia);
        mediaRepository.updateMedia.mockResolvedValue(updatedMedia);

        await expect(mediaService.updateMedia(1, { altText: "New", caption: "Caption" })).resolves.toEqual(updatedMedia);

        expect(mediaRepository.updateMedia).toHaveBeenCalledWith(1, {
            altText: "New",
            caption: "Caption",
        });
    });

    it("deletes the media row and stored file", async () => {
        mediaRepository.findById.mockResolvedValue({ id: 1, filename: "file.png" });
        mediaRepository.deleteMedia.mockResolvedValue({ affectedRows: 1 });

        await expect(mediaService.deleteMedia(1, testEnv)).resolves.toBeUndefined();

        expect(mediaRepository.deleteMedia).toHaveBeenCalledWith(1);
        expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("file.png"));
    });

    it("ignores missing stored files when deleting media", async () => {
        const error = new Error("missing");
        error.code = "ENOENT";
        mediaRepository.findById.mockResolvedValue({ id: 1, filename: "missing.png" });
        mediaRepository.deleteMedia.mockResolvedValue({ affectedRows: 1 });
        fs.unlink.mockRejectedValue(error);

        await expect(mediaService.deleteMedia(1, testEnv)).resolves.toBeUndefined();
    });

    it("returns 404 for missing media", async () => {
        mediaRepository.findById.mockResolvedValue(undefined);

        await expect(mediaService.getMediaById(99))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS media not found." },
            });
    });
});
