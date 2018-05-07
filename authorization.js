'use strict';

const {
	AbilityBuilder,
	Ability
} = require('casl');

module.exports.ability = () =>
	((req, res, next) => {
		const {
			rules,
			can,
			cannot
		} = AbilityBuilder.extract();

		const name = req.query.name || req.body.name || 'anon';
		const role = req.query.role || req.body.role || 'anon';

		if (role === 'anon') {
			can('read', 'commit');
			can('read', 'repo');
		}

		if (role === 'member') {
			can('read', ['repo', 'commit']);
			can('create', 'repo');
			can('update', 'repo', {
				author: name
			});
			can(['update', 'create'], 'commit');
		}

		if (role === 'moderator') {
			can('manage', ['repo', 'commit']);
			cannot('create', ['repo', 'commit']);
		}

		req.ability = new Ability(rules);

		next();
	});

module.exports.checkAuth = (ability, action, obj) => {
	if (obj && ability && ability.cannot(action, obj)) {
		return {
			access: false,
			error: {
				message: `Unauthorized access. Action ${action} on item ${obj._modelOptions.name.singular}`,
				status: 403
			}
		};
	}
	return {
		access: true
	};
};