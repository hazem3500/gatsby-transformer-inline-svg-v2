const fs = require(`fs`).promises;

const { GraphQLString } = require(`gatsby/graphql`);
const SVGO = require('svgo');

const svgo = new SVGO({
    multipass: true,
    floatPrecision: 2,
    plugins: [
        { removeDoctype: true },
        { removeXMLProcInst: true },
        { removeComments: true },
        { removeMetadata: true },
        { removeXMLNS: false },
        { removeEditorsNSData: true },
        { cleanupAttrs: true },
        { inlineStyles: true },
        { minifyStyles: true },
        { convertStyleToAttrs: true },
        { cleanupIDs: true },
        { prefixIds: true },
        { removeRasterImages: true },
        { removeUselessDefs: true },
        { cleanupNumericValues: true },
        { cleanupListOfValues: true },
        { convertColors: true },
        { removeUnknownsAndDefaults: true },
        { removeNonInheritableGroupAttrs: true },
        { removeUselessStrokeAndFill: true },
        { removeViewBox: false },
        { cleanupEnableBackground: true },
        { removeHiddenElems: true },
        { removeEmptyText: true },
        { convertShapeToPath: true },
        { moveElemsAttrsToGroup: true },
        { moveGroupAttrsToElems: true },
        { collapseGroups: true },
        { convertPathData: true },
        { convertTransform: true },
        { removeEmptyAttrs: true },
        { removeEmptyContainers: true },
        { mergePaths: true },
        { removeUnusedNS: true },
        { sortAttrs: true },
        { removeTitle: true },
        { removeDesc: true },
        { removeDimensions: false },
        { removeAttrs: false },
        { removeAttributesBySelector: false },
        { removeElementsByAttr: false },
        { addClassesToSVGElement: false },
        { removeStyleElement: false },
        { removeScriptElement: true },
        { addAttributesToSVGElement: false },
        { removeOffCanvasPaths: true },
        { reusePaths: false },
    ],
});

exports.createSchemaCustomization = ({ actions, schema }) => {
    const inlineSvgType = schema.buildObjectType({
        name: `InlineSvg`,
        fields: {
            content: { type: GraphQLString },
        },
        interfaces: [`Node`],
        extensions: {
            infer: true,
            childOf: {
                types: [`File`],
            },
        },
    });

    actions.createTypes([inlineSvgType]);
};

exports.onCreateNode = function ({ node, actions, createNodeId }) {
    const { createNode, createParentChildLink } = actions;
    if (node.extension !== 'svg') return;
    const inlineSvgNode = {
        id: createNodeId(`${node.id} >> InlineSvg`),
        children: [],
        parent: node.id,
        internal: {
            contentDigest: `${node.internal.contentDigest}`,
            type: `InlineSvg`,
        },
    };

    createNode(inlineSvgNode);
    createParentChildLink({ parent: node, child: inlineSvgNode });
};

exports.createResolvers = ({
    createResolvers,
    getNodeAndSavePathDependency,
}) => {
    const resolvers = {
        InlineSvg: {
            content: {
                resolve: async (image, fieldArgs, context) => {
                    const { absolutePath } = getNodeAndSavePathDependency(
                        image.parent,
                        context.path
                    );
                    const svg = await fs.readFile(absolutePath);
                    if (!svg) {
                        return null;
                    }
                    try {
                        const { data: optimizedSVG } = await svgo.optimize(
                            svg,
                            {
                                path: absolutePath,
                            }
                        );
                        return optimizedSVG;
                    } catch {
                        return null;
                    }
                },
            },
        },
    };
    createResolvers(resolvers);
};
