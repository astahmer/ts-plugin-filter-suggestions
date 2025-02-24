export interface Options {
	enableLogs?: boolean;
	hideSuggestionsIfLessThan?: number;
}

export const exampleOptions: Options = {} as Options;
export const nested = {
	inside: { obj: exampleOptions },
	another: { obj: exampleOptions },
};

// nested.inside.obj.
// nested["inside"].
type Role = "admin" | "user";
type Pattern = `${Role} oui`;
const oui: Pattern = `admin oui`;

nested.inside;
// nested.inside.;
// nested.
// nested.inside.obj.
// nested?.o
