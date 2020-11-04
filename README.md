brave-versions
===

Generate an easily queryable JSON dataset about Brave public releases

This script stitches together data about public
[Brave releases](https://github.com/brave/brave-browser/releases) from Github and the
`package.json` data from [brave-browser](https://github.com/brave/brave-browser) to produce
a central dataset about Brave versions.

# Getting started

**Dependencies**

- [nvm](https://github.com/nvm-sh/nvm)
- [yarn](https://yarnpkg.com/getting-started/install)

**Clone and install dependencies**

```bash
git clone https://github.com/marshall/brave-versions
cd brave-versions

nvm use
yarn install
```

**Run brave-versions**

```bash
yarn run brave-versions
```

Generated metadata lives by default in `$HOME/.brave-versions/final-releases.json`

# Configuration

Configuration is currently done through environment variables / dotenv.

| Environment Variable | Description |
| -------------------- | ------------|
| `BRAVE_VERSIONS_DIR` | path where the dataset is saved, by default this is $HOME/.brave-versions |
| `GITHUB_TOKEN` | optional authorization token for Github API (use to raise the Github API rate limit) |

# Data format

```javascript
{
  "<git tag>": {
    "tag": "<git tag>",
    "name": "<version name>",
    "channel": "stable|beta|nightly|dev",
    "commit": "<git sha>",
    "published": "<release publish date/time>",
    "dependencies": {
      "chrome": "<chrome version>",
      "widevine": "<widevine version>"
    },
    "github": {
      "release_id": "<github release id>",
      "assets": [
        {
          "id": "<github asset id>",
          "name": "<filename>",
          "download_url": "<github download url>"
        },
        //...
      ]
    }
  },
  //...
}
```


