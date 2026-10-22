const fs = require('node:fs')
const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Le cœur (sous-module core/) contient les paquets du workspace : Metro doit le surveiller,
// y compris quand core/ est un lien symbolique (développement du cœur).
const core = fs.realpathSync(path.join(__dirname, 'core'))
config.watchFolders = [...new Set([...(config.watchFolders ?? []), core])]
config.resolver.nodeModulesPaths = [path.join(__dirname, 'node_modules')]
// Un éventuel node_modules propre au cœur ne doit jamais être embarqué (doublons React/Tamagui).
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
config.resolver.blockList = [new RegExp(`^${escape(path.join(core, 'node_modules'))}/.*`)]

module.exports = config
