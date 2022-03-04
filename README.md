# Obsidian Steemit Plugin

Post directly to your Steemit from Obsidian.

## Instructions

- From the plugin settings page, add your credentials
- Make sure your Steemit user has the ability to create posts
- Verify your settings are working from the plugin settings page
- Use the "Publish to Steemit" command to upload the current page to your WordPress website

## Plugin Options

- In the front matter you can specify various meta-data for your post:
  - Categories and tags can be slugs or IDs.
  - Specify the "permlink" if you want a specific URL for your post.

### Example Front Matter:

```yml
---
permlink: this-is-a-permlink
category: hive-137029
tags: kr-dev steemit
---
```

### Commenting

Text surrounded by HTML comment tags (see below), will be ignored and not published to Steemit. Handy if there are bits you want to exclude from Steemit but keep in the same Obsidian markdown file.

```plaintext
<!--
This is a multi-line
comment, cool!
-->
```

```plaintext
<!-- This is an in-line comment. -->
```
