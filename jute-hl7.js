#!/usr/bin/env node

const jute = require("./jute.js/lib/jute");
const hl7grok = require("./hl7grok/lib/hl7grok");
const fs = require("fs");

var isBlank, removeBlanks;

isBlank = function(val) {
  return val === null || val === void 0 || val === '' || (Array.isArray(val) && val.length === 0);
};

removeBlanks = function(rootNode) {
  var atLeastOneKey, k, newNode, newV, trimmed, v;
  if (typeof rootNode === 'object') {
    if (Array.isArray(rootNode)) {
      newNode = rootNode.map(function(e) {
        return removeBlanks(e);
      });
      newNode = newNode.filter(function(e) {
        return !isBlank(e);
      });
      if (isBlank(newNode)) {
        return null;
      } else {
        return newNode;
      }
    } else if (rootNode instanceof Date) {
      return rootNode;
    } else {
      newNode = {};
      atLeastOneKey = false;
      for (k in rootNode) {
        v = rootNode[k];
        newV = removeBlanks(v);
        if (!isBlank(newV)) {
          atLeastOneKey = true;
          newNode[k] = newV;
        }
      }
      if (atLeastOneKey) {
        return newNode;
      } else {
        return null;
      }
    }
  } else {
    if (isBlank(rootNode)) {
      return null;
    } else {
      if (typeof rootNode === 'string') {
        trimmed = rootNode.trim();
        if (isBlank(trimmed)) {
          return null;
        } else {
          return trimmed;
        }
      } else {
        return rootNode;
      }
    }
  }
};

const msg = fs.readFileSync("./adt.hl7", 'utf8').replace(/\n/g, "\r");
const yaml = require("js-yaml");
const mapping = yaml.safeLoad(fs.readFileSync("adt.yml", 'utf8'));

const parsedMsg = hl7grok.grok(msg, {strict: false});

const structurizedMsg = hl7grok.structurize(parsedMsg[0]);

console.log("!!!!!!", JSON.stringify(structurizedMsg[1], null, 2));

const transformed = jute.transform(structurizedMsg[0], mapping, { directives: {} });

console.log(JSON.stringify(removeBlanks(transformed), null, 2));
