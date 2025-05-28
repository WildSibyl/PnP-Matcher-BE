const calculateMatchScore = (userA, userB, distance) => {
  let score = 0;
  const minScore = 1;
  const maxScore = 99;
  const medFilter = 10; //max points for a filter with medium weight
  const hiFilter = 15; //max points for a filter with high weight
  const deductFilter = 5; //points that will be deducted for each like/dislike clash
  const maxDeduct = 25; //max point that will be deducted in the like/dislike check

  const scoreRatio = (aList = [], bList = [], weight) => {
    const unique = new Set([...aList, ...bList]).size; //Get number of unique values from user A AND B
    const bSet = new Set([...bList]); //create a set from B for easier and faster searchability
    const shared = aList.filter((item) => bSet.has(item)).length; //check number of matching values between A and B
    const ratio = unique === 0 ? 0 : shared / unique; //How many of the total values in their profiles are shared? Returns value between 0 and 1
    return Math.round(ratio * weight); //Set max points to get out of this category according to weight
  };

  //Game Systems Check
  score += scoreRatio(userA.systems, userB.systems, medFilter);

  //Likes check
  score += scoreRatio(userA.likes, userB.likes, hiFilter);

  //Dislikes check
  score += scoreRatio(userA.dislikes, userB.dislikes, medFilter);

  // Weekdays check
  score += scoreRatio(userA.weekdays, userB.weekdays, hiFilter);

  // Playstyles check
  score += scoreRatio(userA.playstyles, userB.playstyles, medFilter);

  //Negative check (See if userB disliked something that userA likes)
  const bDislikeSet = new Set(userB.dislikes);
  const dislikeClashes = userA.likes.filter((item) =>
    bDislikeSet.has(item)
  ).length;
  score -= Math.min(dislikeClashes * deductFilter, maxDeduct); //deduct points for each likes/dislikes clashes

  //Check Radius
  if (distance < 10000) {
    score += 15;
  } else if (distance < 15000) {
    score += 10;
  } else if (distance < 30000) {
    score += 5;
  } else {
    score += 0;
  }

  //Normalize score, so that it's minimum 0 and maximum 99
  const normalizedScore = Math.max(minScore, Math.min(score, maxScore));

  return normalizedScore;
};

export default calculateMatchScore;
