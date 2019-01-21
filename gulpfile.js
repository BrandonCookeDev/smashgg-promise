'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const { src, dest, parallel } = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const ts = require('gulp-typescript')

const ROOT_DIR = __dirname;
const FILE_NAME = 'smashgg.js';
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STAGE_DIR = path.join(ROOT_DIR, 'src', 'dist');
const BABEL_PRESETS = [
	'@babel/env',
	{
		targets: {
			edge: "17",
			firefox: "60",
			chrome: "67",
			safari: "11.1",
		},
		"useBuiltIns": "usage"
	}
]
const BABEL_PLUGINS =  ["transform-es2015-modules-commonjs"]


let onlyProductionJS = [
	'src/js/*.js'
];

function makeOneFileToRuleThemAll(){
	return gulp.src(onlyProductionJS)
		.pipe(concat('smashgg.js'))
		.pipe(gulp.dest('src/dist'))
}

function tsc(){
	return gulp.src('src/ts/*.ts')
		.pipe(ts({
			target: 'ES2015',
			declaration: false,
			outDir: 'src/js',
			rootDir: 'src/ts'
		}))
}

function babelc(){
	return gulp.src(onlyProductionJS)
		.pipe(babel({
			presets: [BABEL_PRESETS],
			plugins: [BABEL_PLUGINS]
		}))
		.pipe(gulp.dest('src/js'))
}

exports.tsc = tsc;
exports.babelc = babelc;
exports.makeOneFileToRuleThemAll = makeOneFileToRuleThemAll;
exports.default = parallel(makeOneFileToRuleThemAll, babelc);
          