/**
 * WARNING! 
 * Do not edit this file!
 * It has been generated from this source:
 * 
 *   primitive.vert
 * 
 * 2023-12-20T08:23:05.764Z
 */
const SHADER = "#version 300 es\n\nuniform vec4 uniColor;\nout vec4 varColor;\n{{COMPUTE}}\n\nvoid main() {\n    varColor = uniColor;\n    compute();\n}\n"
export default SHADER
