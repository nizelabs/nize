interface BooleanFilter {
	equals?: boolean;
	not?: boolean;
}

interface IntegerFilter {
	equals?: string;
	not?: string;
	in?: string[];
	notIn?: string[];
	lt?: string;
	lte?: string;
	gt?: string;
	gte?: string;
}

interface StringFilter {
	equals?: string;
	not?: string;
	in?: string[];
	notIn?: string[];
	contains?: string;
	startsWith?: string;
	endsWith?: string;
}

interface User {}

interface UserCreateArgs {
	data: {
		id?: string;
		email: string;
	};
	select?: UserSelect;
	upsert?: boolean;
}

interface UserDeleteArgs {
	select?: UserSelect;
	where?: UserFilter;
}

interface UserFindFirstArgs {
	select?: UserSelect;
	where?: UserFilter;
}

interface UserUpdateArgs {
	data: {
		id?: string;
		email?: string;
	};
	select?: UserSelect;
	upsert?: boolean;
	where?: UserFilter;
}

interface UserFilter {
	AND?: UserFilter[];
	OR?: UserFilter[];
	NOT?: UserFilter;
	id?: string | StringFilter;
	email?: string | StringFilter;
}

interface UserSelect {
	id?: boolean;
	email?: boolean;
}

interface UserProcedures {
	create: () => Promise<User | undefined>;
	createMany: () => Promise<User[] | undefined>;
	delete: (args: UserDeleteArgs) => Promise<User | undefined>;
	deleteMany: () => Promise<User[] | undefined>;
	findFirst: (args: UserFindFirstArgs) => Promise<User | undefined>;
	findMany: () => Promise<User[] | undefined>;
	update: (args: UserUpdateArgs) => Promise<User | undefined>;
	updateMany: () => Promise<User[] | undefined>;
}

export function createNizeProxyClient({
	token,
	url,
}: {
	token: string;
	url: string;
}) {
	const _fetch = async () =>
		fetch(url, {
			headers: {
				authorization: `Bearer ${token}`,
			},
		});

	return new Proxy<{
		user: UserProcedures;
	}>(Object.create(null), {
		get(target, p, receiver): UserProcedures {
			return {
				create: async () => {
					// construct sql statements based on args
					// send statements to the specified url
					// handle error if any
					// transform and forward return value

					return {
						id: "",
						email: "",
					};
				},
				createMany: async () => {
					return [
						{
							id: "",
							email: "",
						},
					];
				},
				delete: async () => {
					return {
						id: "",
						email: "",
					};
				},
				deleteMany: async () => {
					return [
						{
							id: "",
							email: "",
						},
					];
				},
				findFirst: async () => {
					return {
						id: "",
						email: "",
					};
				},
				findMany: async () => {
					return [
						{
							id: "",
							email: "",
						},
					];
				},
				update: async () => {
					return {
						id: "",
						email: "",
					};
				},
				updateMany: async () => {
					return [
						{
							id: "",
							email: "",
						},
					];
				},
			};
		},
	});
}

const client = createNizeProxyClient({
	url: "http://localhost:3000/sql",
});
