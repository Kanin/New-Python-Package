import * as assert from 'assert';
import * as vscode from 'vscode';
import { applyTransform, interpolate, PackageContext } from '../utils';

suite('Extension Test Suite', () => {
	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('KaninDev.new-python-package'));
	});

	test('Command should be registered', async () => {
		// Activate the extension first
		const ext = vscode.extensions.getExtension('KaninDev.new-python-package');
		await ext?.activate();
		
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('new-python-package.generatePackage'));
	});
});

suite('applyTransform', () => {
	test(':upper', () => {
		assert.strictEqual(applyTransform('my_module', 'upper'), 'MY_MODULE');
	});

	test(':lower', () => {
		assert.strictEqual(applyTransform('MY_MODULE', 'lower'), 'my_module');
	});

	test(':capitalize', () => {
		assert.strictEqual(applyTransform('my_module', 'capitalize'), 'My_module');
	});

	test(':pascal', () => {
		assert.strictEqual(applyTransform('my_cool_module', 'pascal'), 'MyCoolModule');
		assert.strictEqual(applyTransform('user-service', 'pascal'), 'UserService');
		assert.strictEqual(applyTransform('some module', 'pascal'), 'SomeModule');
	});

	test(':camel', () => {
		assert.strictEqual(applyTransform('my_cool_module', 'camel'), 'myCoolModule');
		assert.strictEqual(applyTransform('user-service', 'camel'), 'userService');
	});

	test(':snake', () => {
		assert.strictEqual(applyTransform('MyCoolModule', 'snake'), 'my_cool_module');
		assert.strictEqual(applyTransform('userService', 'snake'), 'user_service');
	});

	test(':replace', () => {
		assert.strictEqual(applyTransform('my_module', 'replace:_:-'), 'my-module');
		assert.strictEqual(applyTransform('my_module', 'replace:_:'), 'mymodule');
	});

	test(':slice', () => {
		assert.strictEqual(applyTransform('my_module', 'slice:0:2'), 'my');
		assert.strictEqual(applyTransform('my_module', 'slice:3'), 'module');
	});

	test('unknown transform returns original', () => {
		assert.strictEqual(applyTransform('my_module', 'unknown'), 'my_module');
	});
});

suite('interpolate', () => {
	const mockContext: PackageContext = {
		name: 'my_module',
		parent: 'modules',
		fullPath: '/project/src/modules/my_module',
		relativePath: 'src/modules/my_module',
		date: '2026-01-08',
		year: '2026',
	};

	test('simple variable', () => {
		assert.strictEqual(interpolate('${name}', mockContext), 'my_module');
		assert.strictEqual(interpolate('${parent}', mockContext), 'modules');
		assert.strictEqual(interpolate('${year}', mockContext), '2026');
	});

	test('variable with transform', () => {
		assert.strictEqual(interpolate('${name:pascal}', mockContext), 'MyModule');
		assert.strictEqual(interpolate('${name:upper}', mockContext), 'MY_MODULE');
	});

	test('chained transforms', () => {
		assert.strictEqual(interpolate('${name:pascal|lower}', mockContext), 'mymodule');
	});

	test('mixed text and variables', () => {
		assert.strictEqual(
			interpolate('class ${name:pascal}:', mockContext),
			'class MyModule:'
		);
	});

	test('multiple variables', () => {
		assert.strictEqual(
			interpolate('${parent}/${name}', mockContext),
			'modules/my_module'
		);
	});

	test('unknown variable returns empty', () => {
		assert.strictEqual(interpolate('${unknown}', mockContext), '');
	});

	test('no variables returns original', () => {
		assert.strictEqual(interpolate('just text', mockContext), 'just text');
	});
});
