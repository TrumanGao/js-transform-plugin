import babel from 'rollup-plugin-babel';

export default {
    // 核心选项
    input: './src/index.js', // 必须
    output: {
        // 必须 (如果要输出多个，可以是一个数组)
        // 核心选项
        file: `./dist/index.js`, // 必须
        format: 'es', // 必须
        // globals,

        // // 额外选项
        // paths,
        // banner,
        // footer,
        // intro,
        // outro,
        sourcemap: true,
        // sourcemapFile,
        // interop,

        // // 高危选项
        // exports,
        // amd,
        // indent,
        // strict,
    },
    plugins: [
        babel({
            exclude: './node_modules/**',
        }),
    ],

    // 额外选项
    // onwarn,

    // danger zone
    // acorn,
    // context,
    // moduleContext,
    // legacy,
};
