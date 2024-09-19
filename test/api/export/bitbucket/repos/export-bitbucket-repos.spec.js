import { expect } from 'chai';
import { processRepositories } from '../../../../../src/api/export/bitbucket/repos/export-bitbucket-repos.js';
import { columns } from '../../../../../src/api/export/bitbucket/repos/export-bitbucket-repos.js';
import exportBitbucketRepos from '../../../../../src/api/export/bitbucket/repos/export-bitbucket-repos.js';

describe('exportBitbucketRepos', function () {
	let mockStringifier;

	beforeEach(function () {
		mockStringifier = {
			write: function (row) {
				this.rows.push(row);
			},
			rows: [],
		};
	});

	it('should processRepositories writes correct rows', function () {
		const values = [
			{
				name: 'FakeRepo1',
				description: 'Description of FakeRepo1',
				is_private: false,
				links: {
					clone: [
						{ name: 'https', href: 'https://fakerepo1.com' },
						{ name: 'ssh', href: 'ssh://fakerepo1.com' },
					],
				},
			},
			{
				name: 'FakeRepo2',
				description: 'Description of FakeRepo2',
				is_private: true,
				links: {
					clone: [{ name: 'https', href: 'https://fakerepo2.com' }],
				},
			},
		];

		processRepositories(values, mockStringifier);

		expect(mockStringifier.rows).to.have.lengthOf(2);
		expect(mockStringifier.rows).to.deep.include({
			repo: 'FakeRepo1',
			description: 'Description of FakeRepo1',
			url: 'https://fakerepo1.com',
			visibility: 'public',
		});
		expect(mockStringifier.rows).to.deep.include({
			repo: 'FakeRepo2',
			description: 'Description of FakeRepo2',
			url: 'https://fakerepo2.com',
			visibility: 'private',
		});
	});

	it('should columns have specific properties', function () {
		expect(columns.length).to.equal(4);
		expect(columns).to.deep.equal(['repo', 'description', 'url', 'visibility']);
		expect(columns).to.be.an('array');
		expect(columns).to.be.an('array').that.is.not.null;
	});

	it('should exportBitbucketRepos be a function', function () {
		expect(exportBitbucketRepos).to.be.an('function');
	});
});
// TODO: Add more tests
