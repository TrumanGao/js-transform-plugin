// 导入语法
const { VirtualMachine1 } = require('./virtual-machine');
import { VirtualMachine2 } from './virtual-machine';

// @ts-ignore
import { VirtualMachine3, abc } from './virtual-machine';
// @ts-ignore
import { VirtualMachine4 } from './virtual-machine';

function loadProject (input) {
    if (typeof input === 'object' && !(input instanceof ArrayBuffer) && !ArrayBuffer.isView(input)) {
        // If the input is an object and not any ArrayBuffer
        // or an ArrayBuffer view (this includes all typed arrays and DataViews)
        // turn the object into a JSON string, because we suspect
        // this is a project.json as an object
        // validate expects a string or buffer as input
        // TODO not sure if we need to check that it also isn't a data view
        input = JSON.stringify(input);
    }

    const validationPromise = new Promise((resolve, reject) => {
        const validate = require('./ada-school-parser/index.ts');
    }).catch(error => {
        const { SB1File, ValidationError } = require('scratch-sb1-converter');

        return Promise.reject(error);
    });
}

export { VirtualMachine1 };
export const name = new Date();
