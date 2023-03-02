import * as np from "node:path";
import { getDMMF } from "@prisma/internals";

export function generate({
	dmmf,
	trpcPrismaContextKey,
	trpcProcedureBuilder,
	trpcRootFile,
	trpcRouterBuilder,
}: {
	/**
	 * Prisma schema definition.
	 */
	dmmf: Awaited<ReturnType<typeof getDMMF>>;
	/**
	 * tRPC context key for PrismaClient instance.
	 */
	trpcPrismaContextKey: string;
	/**
	 * Name of the exported tRPC [procedure] builder in tRPC root file.
	 */
	trpcProcedureBuilder: string;
	/**
	 * Relative path from `process.cwd()` to source file that contains tRPC instance type export.
	 */
	trpcRootFile: string;
	/**
	 * Name of the exported tRPC router builder in tRPC root file.
	 */
	trpcRouterBuilder: string;
}) {
	const { models } = dmmf.datamodel;

	// generate import statements
	const importStatements: string[] = [
		'import type { Prisma } from "@prisma/client";',
		'import type { initTRPC } from "@trpc/server"',
		`import type { ${trpcProcedureBuilder}, ${trpcRouterBuilder} } from "${np.relative(
			process.cwd(),
			trpcRootFile
		)}"`,
	];
	const typeDeclarations: string[] = [
		"type TRPC = ReturnType<typeof initTRPC.create>;",
	];
	// prettier-ignore
	const functionDeclarations: string[] = [
`async function prismaToTRPC<Function extends (...args: any[]) => Promise<any>>(
  fn: Function,
  ...args: Parameters<Function>
): Promise<ReturnType<Function>> {
  try {
    return await fn(...args);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message,
      });
    } else {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Prisma.PrismaClientUnknownRequestError).message,
      });
    }
  }
}
`,
	];
	const modelRouters: string[] = [];
	const prismaRouterProperties: string[] = [];

	// generate model routers
	for (const model of models) {
		// prettier-ignore
		modelRouters.push(
`export const prisma${model.name}Router = ${trpcRouterBuilder}({
	create: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}CreateArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.create, input);
		}),
	createMany: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}CreateManyArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.createMany, input);
		}),
	delete: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}DeleteArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.delete, input);
		}),
	deleteMany: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}DeleteManyArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.deleteMany, input);
		}),
	findFirst: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}FindFirstArgs)
		.query(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.findFirst, input);
		}),
	findMany: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}FindManyArgs)
		.query(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.findMany, input);
		}),
	update: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}UpdateArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.update, input);
		}),
	updateMany: ${trpcProcedureBuilder}
		.input((input: unknown) => input as Prisma.${model.name}UpdateManyArgs)
		.mutation(async ({ ctx, input }) => {
			return await prismaToTRPC(ctx.${trpcPrismaContextKey}.${uncapitalize(model.name)}.updateMany, input);
		}),
})`
		);
		prismaRouterProperties.push(
			`${uncapitalize(model.name)}: prisma${model.name}Router`
		);
	}

	const prismaRouter = `export const prismaRouter = ${trpcRouterBuilder}({ ${prismaRouterProperties.join(
		", "
	)} })`;

	// concat import statements and model routers
	return [
		importStatements.join("\n"),
		typeDeclarations.join("\n"),
		functionDeclarations.join("\n"),
		modelRouters.join("\n"),
		prismaRouter,
	].join("\n");
}

function uncapitalize(word: string) {
	const [char, ...tail] = word.split("");
	return [char.toLowerCase(), ...tail].join("");
}
