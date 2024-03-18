import { PromptCreationConfig } from "./dto";

declare function createPrompt(
  config: PromptCreationConfig,
  trait_args: Array<{ traitType: string; value: string }>
): string;
