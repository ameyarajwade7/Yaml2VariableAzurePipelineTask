"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const flat_1 = require("flat");
const fs_1 = require("fs");
const yaml = require("js-yaml");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //1. Parse Json file from input
            var yamlFilePath;
            yamlFilePath = tl.getInput("yamlFile", true);
            let rawData = fs_1.readFileSync(yamlFilePath, 'utf-8');
            let data = yaml.load(rawData);
            let flattenVariables = flat_1.flatten(data);
            for (const [key, value] of Object.entries(flattenVariables)) {
                if (key.endsWith("isSecret")) {
                    continue;
                }
                const secretKey = `${key}.isSecret`;
                const isSecret = flattenVariables[secretKey] != undefined && flattenVariables[secretKey].toString().toUpperCase() == 'TRUE';
                console.log(`Creating variable (${key}, ${isSecret}) => ${isSecret ? "*****" : flattenVariables[key]}`);
                const variableValue = flattenVariables[key] != null ? flattenVariables[key].toString() : '';
                tl.setVariable(key, variableValue, isSecret);
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
