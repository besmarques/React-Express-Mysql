# React-Express-Mysql

## Description

This project is a full-stack JavaScript application built with React for the front-end and Express.js for the back-end. It uses MySQL for database management and Axios for handling HTTP requests. The application is bundled and transpiled using Webpack and Babel, respectively. Jest is used for testing, and dotenv is used for managing environment variables. The project also utilizes several other packages to enhance development and production workflows.


# Project Dependencies

This project utilizes several packages to enhance development and production workflows.

## DevDependencies

- [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin): A webpack plugin to copy individual files or entire directories to the build directory.
- [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/): A webpack plugin that simplifies creation of HTML files to serve your webpack bundles.
- [jest](https://jestjs.io/docs/getting-started): Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
- [nodemon](https://www.npmjs.com/package/nodemon): A tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [terser-webpack-plugin](https://webpack.js.org/plugins/terser-webpack-plugin/): A webpack plugin that minifies your JavaScript.
- [webpack](https://webpack.js.org/concepts/): Webpack is a static module bundler for modern JavaScript applications.
- [webpack-cli](https://webpack.js.org/api/cli/): Webpack's command-line interface.
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/): Serves a webpack app and updates the browser on changes.
- [webpack-merge](https://webpack.js.org/loaders/merge/): A webpack plugin to merge configuration objects.
- [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals): A small webpack plugin to exclude all modules in the node_modules directory from the bundled file.

## Dependencies

- [@babel/core](https://babeljs.io/docs/en/babel-core): Babel compiler core.
- [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env): A Babel preset that compiles ES2015+ down to ES5 by automatically determining the Babel plugins and polyfills you need based on your targeted browser or runtime environments.
- [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react): Babel preset for all React plugins, for example, converts JSX and removes React.PropTypes.
- [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js.
- [babel-loader](https://webpack.js.org/loaders/babel-loader/): This package allows transpiling JavaScript files using Babel and webpack.
- [bcrypt](https://www.npmjs.com/package/bcrypt): A library to help you hash passwords. Bcrypt is a password-hashing function designed by Niels Provos and David Mazières, based on the Blowfish cipher.
- [dotenv](https://www.npmjs.com/package/dotenv): Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`.
- [express](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
- [express-mysql-session](https://www.npmjs.com/package/express-mysql-session): A MySQL session store for Express.
- [express-session](https://www.npmjs.com/package/express-session): Simple session middleware for Express.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): An implementation of JSON Web Tokens. This is a compact, URL-safe means of representing claims to be transferred between two parties.
- [mysql2](https://www.npmjs.com/package/mysql2): MySQL client for Node.js with focus on performance. Supports prepared statements, non-utf8 encodings, binary log protocol, compression, ssl and much more.
- [newrelic](https://www.npmjs.com/package/newrelic): New Relic's official Node.js agent. This package instruments your application for performance monitoring with New Relic.
- [react](https://reactjs.org/): A JavaScript library for building user interfaces.
- [react-dom](https://reactjs.org/docs/react-dom.html): Serves as the entry point to the DOM and server renderers for React.
- [react-router-dom](https://reactrouter.com/web/guides/quick-start): DOM bindings for React Router.
- [winston](https://www.npmjs.com/package/winston): A logger for just about everything.
- [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file): A transport for winston which can rotate files by day, month, or year.


## Installation

To install the necessary dependencies, run the following command:

```bash
    npm install
```

## Scripts
```bash
    npm test - Run tests with Jest
```
```bash
    npm run build - Create a production build with webpack and create a package.json file with the needed dependencies
```
```bash
    npm run dev - Create a development build with webpack and run the server
```

## License
This project is licensed under the ISC license.

## File Structure
```bash
React-Express-Mysql/
├── dist/
│   ├── public/
│   │   └── index.html
│   ├── client.js
│   ├── client.js.LICENSE.txt
│   ├── server.js
│   └── package.json
├── public/
│   └── index.html
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── Footer.js
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateWrapper.js
│   │   │   └── Sidebar.js
│   │   ├── layouts/
│   │   │   ├── ContentOnly.js
│   │   │   ├── FullLayout.js
│   │   │   └── NoSidebarLayout.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   └── Teste.js
│   │   ├── store/
│   │   │   ├── appContext.js
│   │   │   └── flux.js
│   │   ├── index.js
│   │   └── layout.js
│   └── server/
│       ├── config/
│       │   ├── dbpool.js
│       │   ├── logger.js
│       │   └── sessionConfig.js
│       ├── main/
│       │   └── mainRoutes.js
│       ├── user/
│       │   └── userRoutes.js
│       └── server.js
├── generatePackageJson.js
├── newrelic.js
├── package.json
├── package-lock.json
├── webpack.commmon.js
├── webpack.dev.js
├── webpack.prod.js
└── README.md
```