import { z } from "zod";

export const projectCreateSchema = z.object({
  // Name
  name: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "name is required";
        return "name must be a string";
      },
    })
    .trim()
    .min(1, "name cannot be empty"),

  // navLink
  navLink: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "navLink is required";
        return "navLink must be a string";
      },
    })
    .trim()
    .min(1, "navLink cannot be empty"),

  // description
  description: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "description is required";
        return "description must be a string";
      },
    })
    .trim()
    .min(1, "description cannot be empty"),

  // readmeContent
  readmeContent: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "readmeContent is required";
        return "readmeContent must be a string";
      },
    })
    .trim()
    .min(1, "readmeContent cannot be empty"),

  // gitHubLink
  gitHubLink: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "gitHubLink is required";
        return "gitHubLink must be a string";
      },
    })
    .url("gitHubLink must be a valid URL"),

  // liveLink
  liveLink: z
    .string({
      error: (issue) => {
        if (issue.input === undefined) return "liveLink is required";
        return "liveLink must be a string";
      },
    })
    .url("liveLink must be a valid URL"),

  // images
  images: z
    .array(z.string().url("images must be valid URLs"), {
      error: (issue) => {
        const path = issue.path.join(".");
        if (issue.input === undefined) return `${path} is required`;
        return `${path} must be an array of links`;
      },
    })
    .max(12, "Maximum 12 images per project")
    .nonempty("images must be an array of links"),

  // tags
  tags: z
    .array(
      z.object({
        topic: z
          .string({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid string`;
            },
          })
          .trim()
          .min(1, {
            error: (issue) => {
              const path = issue.path.join(".");
              return `${path} cannot be an empty string`;
            },
          }),
      }),
      {
        error: (issue) => {
          if (issue.input === undefined) return "tags array is required";
          return "tags must be an array of objects containing a topic"
        },
      }
    )
    .nonempty("tags must be an array of objects containing a topic"),

  // developmentSummary
  developmentSummary: z
    .array(
      z.object({
        title: z
          .string({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid string`;
            },
          })
          .trim()
          .min(1, {
            error: (issue) => {
              const path = issue.path.join(".");
              return `${path} cannot be an empty string`;
            },
          }),
        value: z
          .string({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid string`;
            },
          })
          .trim()
          .min(1, {
            error: (issue) => {
              const path = issue.path.join(".");
              return `${path} cannot be an empty string`;
            },
          }),
      }),
      {
        error: (issue) => {
          const path = issue.path.join(".");
          if (issue.input === undefined) return `${path} array is required`;
          return "developmentSummary must be an array of objects containing title and value"
        },
      }
    )
    .nonempty(
      "developmentSummary must be an array of objects containing title and value"
    ),

  // languagesUsed
  languagesUsed: z
    .array(
      z.object({
        name: z
          .string({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid string`;
            },
          })
          .trim()
          .min(1, {
            error: (issue) => {
              const path = issue.path.join(".");
              return `${path} cannot be an empty string`;
            },
          }),
        percent: z
          .number({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid number`;
            },
          })
          .min(0, {
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be at least 0`;
            },
          })
          .max(100, {
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} cannot exceed 100`;
            },
          }),
        color: z
          .string({
            error: (issue) => {
              const path = issue.path.join(".");
              if (issue.input === undefined) return `${path} is required`;
              return `${path} must be a valid string`;
            },
          })
          .trim()
          .min(1, {
            error: (issue) => {
              const path = issue.path.join(".");
              return `${path} cannot be an empty string`;
            },
          }),
      }),
      {
        error: (issue) => {
          const path = issue.path.join(".");
          if (issue.input === undefined) return `${path} array is required`;
          return "languagesUsed must be an array of object containing name, percentage and color"
        },
      }
    )
    .nonempty(
      "languagesUsed must be an array of object containing name, percentage and color"
    ),
});

export const projectUpdateSchema = projectCreateSchema.partial();