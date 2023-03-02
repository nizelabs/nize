import { extractDmmf } from "nize";

extractDmmf().catch((error) => {
	console.error(error);
	process.exit(1);
});
