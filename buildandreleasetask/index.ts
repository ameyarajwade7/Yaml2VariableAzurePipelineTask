import tl = require('azure-pipelines-task-lib/task');
import { flatten } from "flat";
import { PathLike, readFileSync } from "fs";
import yaml = require('js-yaml');

async function run() {
    try {
        //1. Parse Json file from input
        var yamlFilePath: string | undefined;
        yamlFilePath = tl.getInput("yamlFile", true);
        let rawData: any = readFileSync(yamlFilePath as PathLike,'utf-8');
        let data: any = yaml.load(rawData);
        let flattenVariables: any = flatten(data);   
        for (const [key, value] of Object.entries(flattenVariables)) {
            if (key.endsWith("isSecret")) {
                continue;
            }
            const secretKey: string = `${key}.isSecret`;
            const isSecret: boolean = flattenVariables[secretKey] != undefined && flattenVariables[secretKey].toString().toUpperCase() == 'TRUE';
            console.log(`Creating variable (${key}, ${isSecret}) => ${isSecret ? "*****" : flattenVariables[key]}`);
            const variableValue: string = flattenVariables[key] != null ? flattenVariables[key].toString() : '';
            tl.setVariable(key, variableValue, isSecret);
        }

    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();