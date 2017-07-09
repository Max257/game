// @flow
import { range } from 'lodash';

import type { HpType, ThingType, IslandType, CombatType, HeroType, CombatLogType } from './types';

export function countHp(hp: HpType): HpType {
  const now = new Date().getTime();
  const delay = 100;

  let { current } = hp;
  const { time, max } = hp;

  if (current === max) {
    return hp;
  }

  current += ((now - time) / 1000) / (delay / max);

  if (current > max) current = max;

  current = parseInt(current, 10);

  return { current, time: new Date().getTime(), max };
}

export function getFeatureParam(orig: number, feature: number): string {
  let output = '';
  if (orig - feature === 0) {
    return output;
  }

  output += ' [';

  if (feature > orig) {
    output += '+';
  }

  output += feature - orig;

  output += ']';
  return output;
}

export function thingImageRequire(name: string) {
  switch (name) {
    case 'gloves.png':
      return require('../assets/things/gloves.png');
    case 'armor.png':
      return require('../assets/things/armor.png');
    case 'helmet.png':
      return require('../assets/things/helmet.png');
    default: return null;
  }
}

export function thingSlotImageRequire(type: string) {
  switch (type) {
    case 'gloves':
      return require('../assets/images/gloves.svg');
    case 'helmet':
      return require('../assets/images/helmet.svg');
    case 'amulet':
      return require('../assets/images/amulet.svg');
    case 'bracer':
      return require('../assets/images/bracer.svg');
    case 'sword':
      return require('../assets/images/sword.svg');
    case 'armor':
      return require('../assets/images/armor.svg');
    case 'pants':
      return require('../assets/images/pants.svg');
    case 'shield':
      return require('../assets/images/shield.svg');
    case 'belt':
      return require('../assets/images/belt.svg');
    case 'boots':
      return require('../assets/images/boots.svg');
    default: return null;
  }
}

export function islandImageRequire(name: string) {
  switch (name) {
    case '1.png':
      return require('../assets/islands/1.png');
    default: return null;
  }
}

export function arrayContains(haystack: Array<Array<number>>, needle: Array<number>): boolean {
  for (let i = 0; i < haystack.length; i += 1) {
    if (needle.length === haystack[i].length) {
      const current = haystack[i];
      let j;
      for (j = 0; j < needle.length && needle[j] === current[j]; j += 1);
      if (j === needle.length) return true;
    }
  }
  return false;
}

export function getMapMargin(
  x: number, y: number,
  mapDimensions: { width: number, height: number },
  islandDimensions: { width: number, height: number },
): { left: number, top: number } {
  // 5, 3
  // [[],[],[],  [],[]]
  // [[],[],[], [],[]]
  // [[], [],[],[], []]
  // [[],[], [],[],[]]
  // [[],[],  [],[],[]]

  // 1 - 3 / 2 = -0.5
  // 2 - 3 / 2 = 0.5
  // 3 - 3 / 2 = 1.5 | 3.5 < 3 false
  // 4 - 3 / 2 = 2.5 | 2.5 < 3 true
  // 5 - 3 / 2 = 3.5 | 1.5 < 3 true

  // 6, 3
  // [[],[],[],  [],[],[]]
  // [[],[],[], [],[],[]]
  // [[], [],[],[], [],[]]
  // [[],[], [],[],[], []]
  // [[],[],[], [],[],[]]
  // [[],[],[], [],[],[]]

  // 1 - 3 / 2 = -0.5
  // 2 - 3 / 2 = 0.5
  // 3 - 3 / 2 = 1.5 | 4.5 < 3 false
  // 4 - 3 / 2 = 2.5 | 3.5 < 3 false
  // 5 - 3 / 2 = 3.5 | 2.5 < 3 true
  // 6 - 3 / 2 = 4.5 | 1.5 < 3 true

  // 6, 4
  // [[],[],[],[]  [],[]]
  // [[],[],[],[], [],[]]
  // [[], [],[],[],[], []]
  // [[],[], [],[],[],[]]
  // [[],[], [],[],[],[]]
  // [[],[], [],[],[],[]]

  // 1 - 4 / 2 = -1
  // 2 - 4 / 2 = 0
  // 3 - 4 / 2 = 1 | 5 < 4 false
  // 4 - 4 / 2 = 2 | 4 < 4 false
  // 5 - 4 / 2 = 3 | 3 < 4 true
  // 6 - 4 / 2 = 4 | 2 < 4 true

  const mapMargin = {
    left: x - (mapDimensions.width / 2),
    top: y - (mapDimensions.height / 2),
  };

  if (Math.floor(mapMargin.left) <= 0) {
    mapMargin.left = 0;
  } else if (islandDimensions.width - mapMargin.left <= mapDimensions.width) {
    mapMargin.left = islandDimensions.width - mapDimensions.width;
  }

  if (Math.floor(mapMargin.top) <= 0) {
    mapMargin.top = 0;
  } else if (islandDimensions.height - mapMargin.top <= mapDimensions.height) {
    mapMargin.top = islandDimensions.height - mapDimensions.height;
  }

  return mapMargin;
}

export function getThing(things: Array<ThingType>, id: string): ThingType {
  return things.find(item => item.id === id);
}

export function getIsland(islands: Array<IslandType>, id: string): IslandType {
  return islands.find(item => item.id === id);
}

export function mapObjToArray(obj: {}): Array<any> {
  return Object.keys(obj).map(key => ({ id: key, ...obj[key] }));
}

export function isAllDead(combat: CombatType, team: number) {
  return combat.warriors.some(warrior => warrior.isDead && warrior.team === team);
}

export function getDamage(combat: CombatType, hero: HeroType): number {
  let damage = 0;

  combat.logs
    .filter(item => item.warriorOne)
    .forEach(({ warriorOne, warriorTwo }) => {
      if (combat.warriors[0].warrior === hero.id && warriorOne.experience) {
        damage += warriorOne.damage;
      } else if (combat.warriors[1].warrior === hero.id && warriorTwo.experience) {
        damage += warriorOne.damage;
      }
    });

  return damage;
}

export function notQuiteFromCombat() {
  return true;
}

export function getBlockItems(startIndex: number, blockCount: number) {
  const amount = 5;

  return range(blockCount).map((item) => {
    const mergedIndex = startIndex + item;
    return mergedIndex >= amount ?
      mergedIndex - amount : mergedIndex;
  });
}

export function getBodyPart(index: number) {
  return ['Head', 'Breast', 'Belly', 'Groin', 'Legs'][index];
}

export function findCombatWarrior(combat: CombatType, id: string) {
  return combat.warriors.find(item => item.warrior === id);
}


// armorBreak block blockBreak devastate dodge

// WarriorOne[lvl] text WarriorOne[lvl] (strike) (block)

// ButuzGOL[0] struck Fog[0] on -5 (all false)

// break armor (armorBreak)
// but blocked (block)
// break block (blockBreak)
// critical strike (devastate)
// but dodged (dodge)

export function getLogLine(combat: CombatType, logItem: CombatLogType) {
  function findWarrior(combat, id) {
    return findCombatWarrior(combat, id)._warrior;
  }
  function buildWarriorName(warrior) {
    return `${warrior.login} [${warrior.level}]`;
  }

  function build(team, strike, logItem) {
    const content = [];
    if (strike.armorBreak) content.push('break armor');
    if (strike.block) content.push('but blocked');
    if (strike.blockBreak) content.push('break block');
    if (strike.devastate) content.push('critical strike');
    if (strike.dodge) content.push('but dodged');
    if (!content.length) content.push('strike');

    const warriorOne = findWarrior(combat, logItem[team === 1 ? 'warriorOne' : 'warriorTwo'].warrior);
    const warriorTwo = findWarrior(combat, logItem[team === 2 ? 'warriorOne' : 'warriorTwo'].warrior);
    const blocks = logItem[team === 1 ? 'warriorOne' : 'warriorTwo'].blocks;
    return `${logItem.created} ${buildWarriorName(warriorOne)} ${content.join(', ')} ${buildWarriorName(warriorTwo)} on ${strike.damage} (${blocks.map(getBodyPart).join(' ')}, ${getBodyPart(strike.strike)})`;
  }

  if (logItem.isDead) {
    const warrior = findWarrior(combat, logItem.warrior);
    return `${buildWarriorName(warrior)} is dead`;
  } else if (logItem.isQuit) {
    const warrior = findWarrior(combat, logItem.warrior);
    return `${buildWarriorName(warrior)} is quit`;
  }

  return [
    ...logItem.warriorOne.strikes.map(strike => build(1, strike, logItem)),
    ...logItem.warriorTwo.strikes.map(strike => build(2, strike, logItem)),
  ].join('\n');
}
