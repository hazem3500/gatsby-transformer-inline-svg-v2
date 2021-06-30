# gatsby-transformer-inline-svg-v2
Inline and optimize SVG's from your GraphQL data source

## Differences From gatsby-transformer-inline-svg
`gatsby-transformer-inline-svg` currently only works with Contentful assets and doesn't work with `File` nodes, so this plugin aims to be CMS agnostic, it can still work with CMS images if they are added via the `gatsby-source-filesystem` via the [createRemoteFileNode API](https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/#createremotefilenode)


## Installation

```sh
npm i gatsby-transformer-inline-svg-v2
```

## Usage

**gatsby-config.js**:

```js
module.exports = {
  plugins: [
    'gatsby-transformer-inline-svg-v2'
  ]
}
```


**GraphQL Query**:
```graphql
file {
    childInlineSvg {
        content
    }
    url
}
```

**Rendering**:
```jsx
import React from 'react'

export default function Image({ file }) {
    // inlined SVG
    if (file?.childInlineSvg?.content) {
        return <div dangerouslySetInnerHTML={{ __html: file?.childInlineSvg?.content }} />
    }

    // other images
    return <img src={file.url} alt={alt} />
}
```
