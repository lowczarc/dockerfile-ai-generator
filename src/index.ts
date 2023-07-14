import fs from "fs";
import * as t from "io-ts";
import { generateWithType } from "polyfact";

function lsR(dir: string, prefix = ""): string[] {
    const arrayOfEntry = fs.readdirSync(prefix + dir).filter(value => !(["Dockerfile","node_modules","target", "yarn.lock", "package-lock.json", "Cargo.lock"].includes(value)) && !value.startsWith("."))
    .map(entry => {
        const stats = fs.statSync(prefix + dir + "/" + entry);
    
        if (stats.isDirectory()) {
            return lsR(entry, prefix + dir + "/")
        }
        return prefix + dir + "/" + entry
    });

    return arrayOfEntry.flat()
}

function read(file: string): string {
    return fs.readFileSync(file, 'utf8')
}

const file_list = lsR(".");

(async () => {
    const { language, manifest_files, source_entrypoint } = await generateWithType(`Analyze the provided directory structure and return the programming language, the program_type, the manifest_file(s) (sorted by importance) and the entrypoint (from the source code). The entrypoint should be a source file and not a compiled file. The source_entrypoint should have an extension. Directory structure: \`\`\`\n${file_list}\n\`\`\`.`, t.type({ language: t.string, manifest_files: t.array(t.string), source_entrypoint: t.string, program_type: t.string, program_type_explanation: t.string })).catch(e => { console.error(e); throw new Error("FAILED AT GENERATION 1") });

    const { start_command, build_commands, dockerfile_dependencies, runtime, name } = await generateWithType(`Analyze the provided manifest file and return the name and version of the runtime (or "latest" if not provided. It must be a valid docker image of  the form "<image_name>:<version>), the command used to start the program, the commands used to install dependency and build the program (if relevant) as well as binary dependencies that needs to be installed in the dockerfile and that will not be installed by the install dependency command (if relevant). Manifest files: \`\`\`${manifest_files.map(e => read(e))[0]}\`\`\``, t.type({ start_command: t.string, build_commands: t.array(t.string), dockerfile_dependencies: t.array(t.string), runtime: t.string, name: t.string })).catch(e => { console.error(e); throw new Error("FAILED AT GENERATION 2") });

    const { program_type, explanation, arguments: args } = await generateWithType(`Analyze the provided entrypoint file and find the program_type. The "program_type" must be either "API", "Web", "CLI". If unsure, say it's a CLI. You should not base the program_type on the language used alone. Entrypoint file: \`\`\`${read(source_entrypoint)}\`\`\`. You must also provide a explanation for the program_type you choose. If command line arguments are defined in this file, list them. If there are none, send a empty list.`, t.type({ program_type: t.string, explanation: t.string, arguments: t.array(t.type({ usage: t.string, description: t.string })) })).catch(e => { console.error(e); throw new Error("FAILED AT GENERATION 2") })

    const { things_to_think_about } = await generateWithType(`What specifically in ${language} needs to be thought of to write a dockerfile ? What could go wrong ? Be short and super specific. If there is nothing particular in the languagem just say "N/A". For example in Go, the app needs to be under the right path in the $GOPATH.`, t.type({ things_to_think_about: t.string }));

    const { dockerfile } = await generateWithType(`Based on this, write a dockerfile: ${JSON.stringify({
                name,
               language,
               manifest_files,
               source_entrypoint,
               start_command,
               build_commands,
               dockerfile_dependencies,
               runtime,
               program_type,
               explanation,
               args,
               file_list,
               things_to_think_about,
    })}`, t.type({ dockerfile: t.string })).catch(e => { console.error(e); throw new Error("FAILED AT GENERATION 2") });

    console.log(dockerfile);
})()
