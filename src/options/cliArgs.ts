import yargs from 'yargs';
import { OptionsFromConfigFiles } from './config/config';

export type OptionsFromCliArgs = ReturnType<typeof getOptionsFromCliArgs>;
export function getOptionsFromCliArgs(
  configOptions: OptionsFromConfigFiles,
  argv: readonly string[]
) {
  const cliArgs = yargs(argv)
    .parserConfiguration({
      'strip-dashed': true,
      'strip-aliased': true,
    })
    .usage('$0 [args]')
    .wrap(Math.max(100, Math.min(120, yargs.terminalWidth())))
    .option('accessToken', {
      alias: 'accesstoken',
      description: 'Github access token',
      type: 'string',
    })
    .option('all', {
      default: configOptions.all,
      description: 'List all commits',
      type: 'boolean',
    })
    .option('author', {
      default: configOptions.author,
      description: 'Show commits by specific author',
      type: 'string',
    })
    .option('backportCreatedLabels', {
      default: configOptions.backportCreatedLabels,
      description: 'Pull request labels for the original PR',
      type: 'array',
    })
    .option('targetBranches', {
      default: [] as string[],
      description: 'Branch(es) to backport to',
      type: 'array',
      alias: 'branch',
      string: true, // ensure `6.0` is not coerced to `6`
    })
    .option('commitsCount', {
      default: configOptions.commitsCount,
      description: 'Number of commits to choose from',
      alias: 'count',
      type: 'number',
    })
    .option('dryRun', {
      default: false,
      description: 'Perform backport without pushing to Github',
      type: 'boolean',
    })
    .option('editor', {
      default: configOptions.editor,
      description: 'Editor to be opened during conflict resolution',
      type: 'string',
    })
    .option('fork', {
      default: configOptions.fork,
      description: 'Create backports in fork or origin repo',
      type: 'boolean',
    })
    .option('gitHostname', {
      default: configOptions.gitHostname,
      description: 'Hostname for Github',
      type: 'string',
    })
    .option('githubApiBaseUrlV3', {
      default: configOptions.githubApiBaseUrlV3,
      description: `Base url for Github's REST (v3) API`,
      type: 'string',
    })
    .option('githubApiBaseUrlV4', {
      default: configOptions.githubApiBaseUrlV4,
      description: `Base url for Github's GraphQL (v4) API`,
      type: 'string',
    })
    .option('labels', {
      default: configOptions.labels,
      description: 'Pull request labels for the resulting backport PRs',
      type: 'array',
    })
    .option('mainline', {
      description:
        'Parent id of merge commit. Defaults to 1 when supplied without arguments',
      type: 'number',
      coerce: (mainline) => {
        // `--mainline` (default to 1 when no parent is given)
        if (mainline === undefined) {
          return 1;
        }

        // use specified mainline parent
        if (Number.isInteger(mainline)) {
          return mainline as number;
        }

        // Invalid value provided
        throw new Error(`--mainline must be an integer. Received: ${mainline}`);
      },
    })
    .option('multiple', {
      default: configOptions.multiple,
      description: 'Select multiple branches/commits',
      type: 'boolean',
    })
    .option('multipleCommits', {
      default: configOptions.multipleCommits,
      description: 'Backport multiple commits',
      type: 'boolean',
    })
    .option('multipleBranches', {
      default: configOptions.multipleBranches,
      description: 'Backport to multiple branches',
      type: 'boolean',
    })
    .option('path', {
      default: configOptions.path,
      description: 'Only list commits touching files under the specified path',
      type: 'string',
    })
    .option('prTitle', {
      default: configOptions.prTitle,
      description: 'Title of pull request',
      type: 'string',
    })
    .option('prDescription', {
      default: configOptions.prDescription,
      description: 'Description to be added to pull request',
      type: 'string',
    })
    .option('pullNumber', {
      description: 'Pull request to backport',
      type: 'number',
      alias: 'pr',
    })
    .option('resetAuthor', {
      default: false,
      description: 'Set yourself as commit author',
      type: 'boolean',
    })
    .option('sha', {
      description: 'Commit sha to backport',
      type: 'string',
      alias: 'commit',
    })
    .option('upstream', {
      default: configOptions.upstream,
      description: 'Name of repository',
      type: 'string',
    })
    .option('sourceBranch', {
      default: configOptions.sourceBranch,
      description: `List commits to backport from another branch than master`,
      type: 'string',
    })
    .option('username', {
      default: configOptions.username,
      description: 'Github username',
      type: 'string',
    })
    .option('verbose', {
      default: false,
      description: 'Show additional debug information',
      type: 'boolean',
    })
    .alias('version', 'v')
    .alias('version', 'V')
    .help().argv;

  // omitting $0 and _
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { $0, _, ...rest } = cliArgs;

  return {
    ...rest,
    accessToken: cliArgs.accessToken || configOptions.accessToken,
    targetBranchChoices: configOptions.targetBranchChoices, // not available as cli argument
    branchLabelMapping: configOptions.branchLabelMapping, // not available as cli argument
    multipleBranches: cliArgs.multipleBranches || cliArgs.multiple,
    multipleCommits: cliArgs.multipleCommits || cliArgs.multiple,
  };
}
