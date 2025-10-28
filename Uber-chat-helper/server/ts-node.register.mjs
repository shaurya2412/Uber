// ts-node.register.mjs
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./node_modules/ts-node/dist/esm.js", pathToFileURL("./"));
