import * as fs from "fs-extra";
import * as np from "node:path";
import { getDMMF } from "@prisma/internals";

export async function extractDmmf() {
	const dmmf = await getDMMF({
		cwd: process.cwd(),
		datamodelPath: "./prisma/schema.prisma",
	});

	const nizeDirectory = np.resolve(process.cwd(), "nize");

	await Promise.all([
		fs.outputFile(
			np.join(nizeDirectory, "datamodel.json"),
			JSON.stringify(dmmf.datamodel, null, 2)
		),
		fs.outputFile(
			np.join(nizeDirectory, "mappings.json"),
			JSON.stringify(dmmf.mappings, null, 2)
		),
	]);
}
