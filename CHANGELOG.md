# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.3](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.2...0.1.3) (2022-07-27)


### Features

* add function parseFrontMatter in utils ([bcda72d](https://github.com/anpigon/obsidian-steemit-plugin/commit/bcda72df1436eb6ae6c4b159ef6b588c98acf097))

### [0.1.2](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.1...0.1.2) (2022-07-11)


### Bug Fixes

* remove ribbon icon button ([7e5e4bb](https://github.com/anpigon/obsidian-steemit-plugin/commit/7e5e4bb8dc6d5f8dfb738849eb384d76e2932778))

### [0.1.1](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.0...0.1.1) (2022-07-10)


### Features

* add addDataToFrontMater and frontMaterToString in utils ([b0f3198](https://github.com/anpigon/obsidian-steemit-plugin/commit/b0f3198f666917fcfaa3db1d584cbd050c546984))
* add function frontMaterToString in utils ([2761771](https://github.com/anpigon/obsidian-steemit-plugin/commit/27617711fe18cc7ef51b584276ccecbadcb4a547))


### Bug Fixes

* trim when parsing tag information in the newPost function of the SteemitClient class ([b97b84d](https://github.com/anpigon/obsidian-steemit-plugin/commit/b97b84dc171fb7f081f42e775e2f08a42decfe41))

## [0.1.0](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.0.9...0.1.0) (2022-06-19)

### [0.0.9](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.0.8...0.0.9) (2022-06-19)

### [0.0.8](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.0.7...0.0.8) (2022-06-19)


### Features

* add post confirmation popup modal ([9b4e1cb](https://github.com/anpigon/obsidian-steemit-plugin/commit/9b4e1cb6adb8358e838dec93764b8349f61478c4))
* add posting confirm modal ([2c2f133](https://github.com/anpigon/obsidian-steemit-plugin/commit/2c2f13347230d722fd71b8c56f21122265d93af2))
* util function getPostDataFromActiveView ([bb87c09](https://github.com/anpigon/obsidian-steemit-plugin/commit/bb87c09980d97ccd0b53afd854c2d46a2796c183))


### Bug Fixes

* isDesktopOnly=true ([48d85d9](https://github.com/anpigon/obsidian-steemit-plugin/commit/48d85d9979d93ebde6607617e3cebef4791c21cd))

### [0.0.7](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.6...0.0.7) (2022-04-05)
- Fix bug

### [0.0.6](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.5...0.0.6) (2022-04-05)
- Added "Import from url" command.

### [0.0.5](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.4...0.0.5) (2022-03-28)
- Added option to change appname of meatadata

### [0.0.4](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.3...0.0.4) (2022-03-13)

- Change the steemjs package to dsteem.
- Reduced bundle size.
- Update permlink after publish.

### [0.0.3](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.2...0.0.3) (2022-03-09)

- Using cachedRead for better performance.
- Using metadataCache.getFileCache(file) and using the resulting frontmatter instead of bringing your own frontmatter+yaml parser, which is bloating your plugin to over 1MB.

### [0.0.2](https://github.dev/anpigon/obsidian-steemit-plugin/compare/0.0.1...0.0.2) (2022-03-05)

- Fixed content being cut off
