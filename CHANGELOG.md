# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.1](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.4.0...0.4.1) (2024-03-29)

## [0.4.0](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.8...0.4.0) (2024-03-29)


### Features

* 보상옵션 ([32dbc92](https://github.com/anpigon/obsidian-steemit-plugin/commit/32dbc92bf2c3e93684abaa31783f723d80f777aa))
* Added Dataview Rendering Feature ([#2](https://github.com/anpigon/obsidian-steemit-plugin/issues/2)) ([28ff0a7](https://github.com/anpigon/obsidian-steemit-plugin/commit/28ff0a77c8446dbf67bf37e7333773c9a5b1459d))
* **constants.ts:** add DEFAULT_FOOTER constant to store default footer text for posts ([fff04fe](https://github.com/anpigon/obsidian-steemit-plugin/commit/fff04fe3773a1925a220ee60e7e8f0b60474cfef))
* **manifest-beta.json:** add manifest file for beta version of the Steemit plugin ([c2f8ebe](https://github.com/anpigon/obsidian-steemit-plugin/commit/c2f8ebeccfc7e42c68dfd685126066e9686e26d7))


### Bug Fixes

* **main.ts:** change method name from newPost to publishPost in SteemitPlugin class to improve clarity and semantics ([c06ad57](https://github.com/anpigon/obsidian-steemit-plugin/commit/c06ad574298099957a5c8332bf52bb9b97a7b70f))
* **main.ts:** change private variable name from #settings to _settings for consistency and improve readability ([7ad0a6a](https://github.com/anpigon/obsidian-steemit-plugin/commit/7ad0a6ad1ff825c713db013bb3c95caf1715dcc2))
* **main.ts:** import FrontMatterCache from 'obsidian' to resolve compilation error ([2d94c08](https://github.com/anpigon/obsidian-steemit-plugin/commit/2d94c0815d0eac425e1bf81f6cdd4e3e2fa3902b))
* **main.ts:** import missing functions from utils file to avoid undefined errors ([1cd7391](https://github.com/anpigon/obsidian-steemit-plugin/commit/1cd73914c414d87355ac760b310e3bad43b3e714))
* **main.ts:** import safeStorage from window.electron.remote.safeStorage to fix undefined error ([51859b1](https://github.com/anpigon/obsidian-steemit-plugin/commit/51859b12c1aa6f543db063899c2a674be4f17f18))
* **main.ts:** import SteemitPostOptions from types to fix missing type error ([b2490cc](https://github.com/anpigon/obsidian-steemit-plugin/commit/b2490cc32b5ce1480d87c5349616c0003ac58ce3))
* **main.ts:** remove unused import and variable declaration to improve code readability and maintainability ([2ef9d4d](https://github.com/anpigon/obsidian-steemit-plugin/commit/2ef9d4d8f3ea5d486b238ee2fe5d38b1aa0c0fd1))
* **settings.ts:** change nullish coalescing operator (??) to logical OR operator (||) for setting default values in text inputs ([652626a](https://github.com/anpigon/obsidian-steemit-plugin/commit/652626a4f12212fb6b162abf1b3776a106ea2d45))
* **settings.ts:** fix saveSettings method to correctly handle saving settings and only save if the value has changed ([34dcb83](https://github.com/anpigon/obsidian-steemit-plugin/commit/34dcb83f8eab72cc7fc0b7dec5e0f538a3827d62))
* **settings.ts:** refactor createSetting method to improve readability and maintainability ([e312158](https://github.com/anpigon/obsidian-steemit-plugin/commit/e312158290f32f44f1f0c22587f8c3ded119a463))
* **settings.ts:** remove 'password' type from CreateSettingArgs interface and replace it with 'text' type with isSecret flag to improve semantics and security ([37ea005](https://github.com/anpigon/obsidian-steemit-plugin/commit/37ea005902d3d0b462bd0bfc26851626fe4c0c00))
* **settings.ts:** remove unused defaultAppName variable ([6325e78](https://github.com/anpigon/obsidian-steemit-plugin/commit/6325e7880d808517ee99d5139833b8212a16f26d))
* **steemit-client.ts:** fix createPrivateKey method to correctly decrypt the password before creating the private key ([0273626](https://github.com/anpigon/obsidian-steemit-plugin/commit/027362673c4dbf75d8d6194a3265d85f659b75b0))
* **steemit-client.ts:** fix import order to follow convention and improve readability ([d64fc52](https://github.com/anpigon/obsidian-steemit-plugin/commit/d64fc52296841a876d70006e301e5a8536bb2ec0))
* **steemit-client.ts:** handle case where post tags are undefined in createTags method ([236c198](https://github.com/anpigon/obsidian-steemit-plugin/commit/236c19883590cc3f4b283311bc859a7965734b7b))
* **steemit-client.ts:** refactor setRewardTypeOptions method to improve readability and maintainability ([1393c19](https://github.com/anpigon/obsidian-steemit-plugin/commit/1393c199b8ac62117d18a3b2464cc603ddea2131))
* **steemit-client.ts:** remove unnecessary line break in constructor parameters for better code readability ([375ee4e](https://github.com/anpigon/obsidian-steemit-plugin/commit/375ee4ef3f7f726d29a055132858ae0a32075204))
* **steemit-client.ts:** replace hardcoded Steem RPC server URL with a constant array of server URLs for flexibility and future expansion ([2131189](https://github.com/anpigon/obsidian-steemit-plugin/commit/2131189ef528c0097d5b1c60dd3dd7cf65688b9a))
* **submit_confirm_modal.ts:** add optional parameter 'category' to the 'getCommunityCategories' method to allow filtering by category ([10e0de9](https://github.com/anpigon/obsidian-steemit-plugin/commit/10e0de91665b7f5cdedaeb4542f0de8f4a11a2c9))
* **submit_confirm_modal.ts:** add validation checks for required fields before submitting the form ([6a17931](https://github.com/anpigon/obsidian-steemit-plugin/commit/6a179317cea6a4cf560fd881b55636579d8fa675))
* **submit_confirm_modal.ts:** fix default category value to be an empty string instead of '0' to improve semantics ([63fa69b](https://github.com/anpigon/obsidian-steemit-plugin/commit/63fa69b88bc212604397007e565b11a499ca46a9))
* **submit_confirm_modal.ts:** fix handleSubmit() method to correctly validate required fields before submitting ([587b04c](https://github.com/anpigon/obsidian-steemit-plugin/commit/587b04c135a9be76cc858867355e5b4cfd7e16f7))
* **submit_confirm_modal.ts:** fix reference to plugin variable to use this.plugin for consistency ([eb49253](https://github.com/anpigon/obsidian-steemit-plugin/commit/eb492537c06d2e3cb4017b1d318472abed498689))
* **submit_confirm_modal.ts:** refactor handleSubmit() method to use a separate validateRequiredFields() method for better code organization and reusability ([42e1608](https://github.com/anpigon/obsidian-steemit-plugin/commit/42e16082e22a4a86ca9cb094dfac30b87e3a81f4))
* **submit_confirm_modal.ts:** refactor initializePostOptions method to simplify code and improve readability ([92c3d4b](https://github.com/anpigon/obsidian-steemit-plugin/commit/92c3d4b18d27468b2c5c888742b93f8711119f7c))

### [0.3.7](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.6...0.3.7) (2024-01-24)

### [0.3.6](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.5...0.3.6) (2024-01-17)

### [0.3.5](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.4...0.3.5) (2023-12-29)


### Bug Fixes

* **main.ts:** import missing functions from utils file to avoid undefined errors ([69e98e3](https://github.com/anpigon/obsidian-steemit-plugin/commit/69e98e3acd2d6c6d82a1a0e50f793bd0851d7ba4))
* **main.ts:** import SteemitPostOptions from types to fix missing type error ([32edcfe](https://github.com/anpigon/obsidian-steemit-plugin/commit/32edcfe11072f1873a905af4e14e215994a1d921))
* **steemit-client.ts:** fix createPrivateKey method to correctly decrypt the password before creating the private key ([9ee652d](https://github.com/anpigon/obsidian-steemit-plugin/commit/9ee652d972b5d50d0504bbf2a91bb02ec87340e9))
* **steemit-client.ts:** handle case where post tags are undefined in createTags method ([2f10356](https://github.com/anpigon/obsidian-steemit-plugin/commit/2f1035674c9143b3dc220798020a143ae88695fd))
* **steemit-client.ts:** refactor setRewardTypeOptions method to improve readability and maintainability ([2efbc5c](https://github.com/anpigon/obsidian-steemit-plugin/commit/2efbc5cd8fe2093d98270b16f2155adbdd0efeae))

### [0.3.4](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.3...0.3.4) (2023-12-29)


### Bug Fixes

* **main.ts:** change method name from newPost to publishPost in SteemitPlugin class to improve clarity and semantics ([b735db1](https://github.com/anpigon/obsidian-steemit-plugin/commit/b735db198f495869858cd4f02439fcbfff87d12a))
* **main.ts:** change private variable name from #settings to _settings for consistency and improve readability ([70ff017](https://github.com/anpigon/obsidian-steemit-plugin/commit/70ff017e5966d4e812ee3c467a0c44f95f925061))
* **steemit-client.ts:** fix import order to follow convention and improve readability ([c92bce3](https://github.com/anpigon/obsidian-steemit-plugin/commit/c92bce330a66a79ad3f258adb47f6922bfd6ce47))

### [0.3.3](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.2...0.3.3) (2023-12-29)


### Bug Fixes

* **settings.ts:** fix saveSettings method to correctly handle saving settings and only save if the value has changed ([546ed3e](https://github.com/anpigon/obsidian-steemit-plugin/commit/546ed3efe65ac33e935743b0004d00afa0798589))
* **settings.ts:** refactor createSetting method to improve readability and maintainability ([d1c8c8a](https://github.com/anpigon/obsidian-steemit-plugin/commit/d1c8c8a178e5f5a9e98d21b8e27cf9ca0a83abb8))
* **settings.ts:** remove 'password' type from CreateSettingArgs interface and replace it with 'text' type with isSecret flag to improve semantics and security ([699ca46](https://github.com/anpigon/obsidian-steemit-plugin/commit/699ca46777e1173e1fd1b8afaaf9a9a94345fc71))
* **submit_confirm_modal.ts:** add validation checks for required fields before submitting the form ([ef1b405](https://github.com/anpigon/obsidian-steemit-plugin/commit/ef1b405c5587df7350df605d7568f8d5243ecfcd))
* **submit_confirm_modal.ts:** fix default category value to be an empty string instead of '0' to improve semantics ([97203b9](https://github.com/anpigon/obsidian-steemit-plugin/commit/97203b9e07fabd6423c36c04303420fdbb3df4ae))
* **submit_confirm_modal.ts:** fix handleSubmit() method to correctly validate required fields before submitting ([d4874f5](https://github.com/anpigon/obsidian-steemit-plugin/commit/d4874f5ff2c71028c3446dcdea708b54bd01d44d))
* **submit_confirm_modal.ts:** fix reference to plugin variable to use this.plugin for consistency ([4a2a562](https://github.com/anpigon/obsidian-steemit-plugin/commit/4a2a56247d9af3ebb51199e528cd33594b89fb33))
* **submit_confirm_modal.ts:** refactor handleSubmit() method to use a separate validateRequiredFields() method for better code organization and reusability ([c305e1d](https://github.com/anpigon/obsidian-steemit-plugin/commit/c305e1d9f8486df1d04054ed84d51b583c9b3bc1))
* **submit_confirm_modal.ts:** refactor initializePostOptions method to simplify code and improve readability ([40f3b45](https://github.com/anpigon/obsidian-steemit-plugin/commit/40f3b45b0c5fabe5020a0d908ba9d543ddd6fd6d))

### [0.3.2](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.1...0.3.2) (2023-12-29)


### Bug Fixes

* **settings.ts:** change nullish coalescing operator (??) to logical OR operator (||) for setting default values in text inputs ([7158f1a](https://github.com/anpigon/obsidian-steemit-plugin/commit/7158f1a5acda0499172c85f237b6f925f3edd545))

### [0.3.1](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.0...0.3.1) (2023-12-29)


### Features

* **constants.ts:** add DEFAULT_FOOTER constant to store default footer text for posts ([b06e826](https://github.com/anpigon/obsidian-steemit-plugin/commit/b06e826bfe08dd689f9dfc84718cebdea69ba1a1))

## [0.3.0](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.3.0-beta-2...0.3.0) (2023-12-20)

## [0.2.0](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.7...0.2.0) (2023-01-10)


### Features

* 보상 옵션 추가 ([f7fddc0](https://github.com/anpigon/obsidian-steemit-plugin/commit/f7fddc03828bd6b0a915b7b9509d1f849b42a534))
* 보상옵션 ([a14567e](https://github.com/anpigon/obsidian-steemit-plugin/commit/a14567eb8b268be468e0445a4c4ef9a67a86a5cb))
* cached AllSubscriptions API ([33990df](https://github.com/anpigon/obsidian-steemit-plugin/commit/33990df55138630c47fd90230c225c743c9689c8))


### Bug Fixes

* memcached 타입 정의 ([e5bd5c3](https://github.com/anpigon/obsidian-steemit-plugin/commit/e5bd5c303f9c3c86bd11327ae3ccc32b8d210761))

### [0.1.8](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.7...0.1.8) (2022-11-27)


### Features

* cached AllSubscriptions API ([33990df](https://github.com/anpigon/obsidian-steemit-plugin/commit/33990df55138630c47fd90230c225c743c9689c8))


### Bug Fixes

* memcached 타입 정의 ([e5bd5c3](https://github.com/anpigon/obsidian-steemit-plugin/commit/e5bd5c303f9c3c86bd11327ae3ccc32b8d210761))

### [0.1.7](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.6...0.1.7) (2022-09-25)


### Features

* removeObsidianComments function ([f7e156b](https://github.com/anpigon/obsidian-steemit-plugin/commit/f7e156bec245a4dfde1e63b942376d83afc9b130))

### [0.1.6](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.5...0.1.6) (2022-09-20)


### Bug Fixes

* Issue of erasing existing Yaml data after posting ([70118f5](https://github.com/anpigon/obsidian-steemit-plugin/commit/70118f5311600251e143e8b650ed5e1889032608))

### [0.1.5](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.4...0.1.5) (2022-07-27)

### [0.1.4](https://github.com/anpigon/obsidian-steemit-plugin/compare/0.1.3...0.1.4) (2022-07-27)

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
