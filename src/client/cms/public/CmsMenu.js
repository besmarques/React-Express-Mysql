import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const renderItems = (items) => (
    <ul className="nav gap-2">
        {items.map((item) => (
            <li className="nav-item" key={item.id}>
                <Link className="nav-link px-0" to={item.url}>{item.label}</Link>
                {item.children && item.children.length > 0 && renderItems(item.children)}
            </li>
        ))}
    </ul>
);

const CmsMenu = ({ location = "primary" }) => {
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadMenu = async () => {
            try {
                const response = await axios.get(`/api/cms/public/menus/${location}`);

                if (isMounted) {
                    setMenu(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    setMenu(null);
                }
            }
        };

        loadMenu();

        return () => {
            isMounted = false;
        };
    }, [location]);

    if (!menu || !menu.items || menu.items.length === 0) {
        return null;
    }

    return (
        <nav className="border-bottom py-3 mb-4" aria-label={menu.name}>
            {renderItems(menu.items)}
        </nav>
    );
};

export default CmsMenu;
