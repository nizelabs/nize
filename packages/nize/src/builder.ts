type FieldType = unknown | BigInt | boolean | number | string | Uint8Array;
type FieldValue = unknown | BigInt | boolean | number | string | Uint8Array;

interface Field<
	$Type extends
		| string
		| "BigInt"
		| "Boolean"
		| "Bytes"
		| "DateTime"
		| "Decimal"
		| "Integer"
		| "Float"
		| "Json"
		| "String",
	$Value extends FieldValue
> {
	/**
	 * @defaultValue undefined
	 */
	default: $Value | undefined;
	/**
	 * @defaultValue false
	 */
	isNullable: boolean;
	/**
	 * @defaultValue false
	 */
	isPrimaryKey: boolean;
	/**
	 * @defaultValue false
	 */
	isUnique: boolean;
	/**
	 * @defaultValue undefined
	 */
	nativeType?: $Value extends string
		? "Char" | "VarChar" | "Text" | "TinyText" | "MediumText" | "LongText"
		: undefined;
	/**
	 * Field's value type alias.
	 */
	type: $Type;
}

type AnyField = Field<string, unknown>;

interface FieldOptions<T extends FieldValue> {
	/**
	 * @defaultValue undefined
	 */
	default?: T;
	/**
	 * @defaultValue false
	 */
	isNullable?: boolean;
	/**
	 * @defaultValue false
	 */
	isPrimaryKey?: boolean;
	/**
	 * @defaultValue false
	 */
	isUnique?: boolean;
	/**
	 * @defaultValue undefined
	 */
	nativeType?: T extends string
		? "CHAR" | "VARCHAR" | "TEXT" | "TINYTEXT" | "MEDIUMTEXT" | "LONGTEXT"
		: never;
}

interface Table<$Fields extends Record<string, AnyField>> {
	fields: $Fields;
	mapTo: string | undefined;
}

interface TableOptions<$Fields extends Record<string, AnyField>> {
	fields: $Fields;
	mapTo?: string;
}

const $builder = {
	create: () => ({
		$field: {
			String: (options: FieldOptions<string> = {}): Field<"String", string> => {
				return {
					default: options.default,
					isNullable:
						options.isNullable !== undefined ? options.isNullable : false,
					isPrimaryKey:
						options.isPrimaryKey !== undefined ? options.isPrimaryKey : false,
					isUnique: options.isUnique !== undefined ? options.isUnique : false,
					type: "String",
				};
			},
		},
		$table: <$Fields extends Record<string, AnyField>>(
			options: TableOptions<$Fields>
		): Table<$Fields> => {
			return {
				fields: options.fields,
				mapTo: options.mapTo,
			};
		},
		$schema: <
			$Tables extends Record<string, { fields: Record<string, AnyField> }>
		>(
			tables: $Tables
		) => {
			return {
				create: () => {
					return {
						tables,
						relationships: {},
					};
				},
				relationships: <
					$Relationships extends Partial<Record<keyof $Tables, {}>>
				>(
					relationships: $Relationships
				) => {
					return {
						create: () => {
							return {
								tables,
								relationships: {},
							};
						},
					};
				},
			};
		},
	}),
};

// example
const { $field, $table, $schema } = $builder.create();

const schema = $schema({
	users: $table({
		fields: {
			name: $field.String({
				nativeType: "TEXT",
			}),
		},
	}),
}).create();
