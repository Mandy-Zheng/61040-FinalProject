export const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Arabic", "Russian", "Japanese", "Bengali", "Dutch", "Urdu", "Polish", "Indonesian", "Korean", "Mandarin", "Cantonese"];

export function getParamNames(f: Function) {
  return f
    .toString()
    .match(/\((.*?)\)/)![1]
    .split(",") // Simple regex to get "name: type" items in signature
    .map((param: string) => param.split("=")[0].trim()); // remove whitespaces
}

export function capitalize(str: string) {
  return str.length === 0 ? str : str.charAt(0).toUpperCase() + str.toString().toLowerCase().slice(1);
}

export function filterOutEmpty(list: Array<string>) {
  return list.filter((str) => str.length !== 0);
}

export function capitalizePhrase(phrase: string) {
  console.log(phrase);
  return phrase
    .split(" ")
    .map((str) => capitalize(str))
    .join(" ");
}
