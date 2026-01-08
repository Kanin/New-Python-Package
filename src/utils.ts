export interface PackageContext {
  name: string;
  parent: string;
  fullPath: string;
  relativePath: string;
  date: string;
  year: string;
}

export function applyTransform(value: string, transform: string): string {
  const [operation, ...args] = transform.split(":");

  switch (operation) {
    case "upper":
      return value.toUpperCase();
    case "lower":
      return value.toLowerCase();
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1);
    case "pascal":
      return value
        .split(/[_\-\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    case "camel":
      const pascal = value
        .split(/[_\-\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    case "snake":
      return value
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[\-\s]+/g, "_")
        .toLowerCase();
    case "replace":
      if (args.length >= 2) {
        return value.split(args[0]).join(args[1]);
      }
      return value;
    case "slice":
      const start = parseInt(args[0]) || 0;
      const end = args[1] ? parseInt(args[1]) : undefined;
      return value.slice(start, end);
    default:
      return value;
  }
}

export function interpolate(template: string, context: PackageContext): string {
  return template.replace(/\$\{(\w+)(?::([^}]+))?\}/g, (_, varName, transforms) => {
    let value = context[varName as keyof PackageContext] ?? "";

    if (transforms) {
      for (const transform of transforms.split("|")) {
        value = applyTransform(value, transform.trim());
      }
    }

    return value;
  });
}
