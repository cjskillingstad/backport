import chalk from 'chalk';
import inquirer, {
  CheckboxQuestion,
  ListQuestion,
  ConfirmQuestion,
} from 'inquirer';
import isEmpty from 'lodash.isempty';
import { CommitChoice } from '../types/Commit';
import { BranchChoice } from '../types/Config';
import { getShortSha } from './github/commitFormatters';

type Question = CheckboxQuestion | ListQuestion | ConfirmQuestion;

async function prompt<T = unknown>(options: Question) {
  const { promptResult } = (await inquirer.prompt([
    { ...options, name: 'promptResult' },
  ])) as { promptResult: T };
  return promptResult;
}

export async function promptForCommits({
  commits,
  isMultipleChoice,
}: {
  commits: CommitChoice[];
  isMultipleChoice: boolean;
}): Promise<CommitChoice[]> {
  const choices = commits.map((c, i) => {
    const backportTags = c.existingBackports
      .map((item) => {
        const styling = item.state === 'MERGED' ? chalk.green : chalk.gray;
        return styling(item.branch);
      })
      .join(', ');

    const position = chalk.gray(`${i + 1}.`);

    return {
      name: `${position} ${c.formattedMessage} ${backportTags}`,
      short: c.pullNumber
        ? `#${c.pullNumber} (${getShortSha(c.sha)})`
        : getShortSha(c.sha),
      value: c,
    };
  });

  const res = await prompt<CommitChoice[]>({
    choices: [...choices, new inquirer.Separator()],
    message: 'Select commit to backport',
    pageSize: 15,
    type: isMultipleChoice ? 'checkbox' : 'list',
  });

  const selectedCommits = Array.isArray(res) ? res.reverse() : [res];
  return isEmpty(selectedCommits)
    ? promptForCommits({ commits, isMultipleChoice })
    : selectedCommits;
}

export async function promptForTargetBranches({
  targetBranchChoices,
  isMultipleChoice,
}: {
  targetBranchChoices: BranchChoice[];
  isMultipleChoice: boolean;
}): Promise<string[]> {
  const res = await prompt<string | string[]>({
    pageSize: 15,
    choices: [...targetBranchChoices, new inquirer.Separator()],
    message: 'Select branch to backport to',
    type: isMultipleChoice ? 'checkbox' : 'list',
  });

  const selectedBranches = Array.isArray(res) ? res : [res];

  return isEmpty(selectedBranches)
    ? promptForTargetBranches({
        targetBranchChoices,
        isMultipleChoice,
      })
    : selectedBranches;
}

export function confirmPrompt(message: string) {
  return prompt<boolean>({ message, type: 'confirm' });
}
