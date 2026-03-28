const generateRoadmap = (deadline, difficulty, timePerWeek) => {
  try {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const totalWeeks = Math.ceil((deadlineDate - today) / millisecondsPerWeek);
    
    if (totalWeeks <= 0) {
      throw new Error('Deadline must be in the future');
    }

    if (totalWeeks < 2) {
      throw new Error('Need at least 2 weeks to complete a goal');
    }

    const totalHoursAvailable = totalWeeks * timePerWeek;

    let milestoneConfig;
    
    if (difficulty === 'easy') {
      milestoneConfig = {
        numMilestones: 2,
        milestoneNames: [
          'Foundations & Basics',
          'Practice & Consolidation'
        ],
        taskTemplates: [
          ['Learn Core Concepts', 'Initial Practice', 'Review Basics'],
          ['Advanced Practice', 'Problem Solving', 'Final Review']
        ]
      };
    } else if (difficulty === 'medium') {
      milestoneConfig = {
        numMilestones: 3,
        milestoneNames: [
          'Foundations & Theory',
          'Intermediate Concepts',
          'Practice & Application'
        ],
        taskTemplates: [
          ['Learn Fundamentals', 'Study Examples', 'Initial Exercises'],
          ['Explore Advanced Topics', 'Compare Approaches', 'Mid-level Problems'],
          ['Real-world Practice', 'Complex Problems', 'Final Assessment']
        ]
      };
    } else if (difficulty === 'hard') {
      milestoneConfig = {
        numMilestones: 4,
        milestoneNames: [
          'Fundamentals & Theory',
          'Intermediate & Advanced',
          'System Design & Architecture',
          'Mastery & Optimization'
        ],
        taskTemplates: [
          ['Learn Core Concepts', 'Study Patterns', 'Solve Basic Problems'],
          ['Learn Advanced Topics', 'Compare Techniques', 'Solve Medium Problems'],
          ['Study System Design', 'Learn Scalability', 'Design Practice'],
          ['Solve Hard Problems', 'Optimize Solutions', 'Teach Others']
        ]
      };
    }

    const weeksPerMilestone = Math.floor(totalWeeks / milestoneConfig.numMilestones);
    const remainingWeeks = totalWeeks % milestoneConfig.numMilestones;

    const milestones = [];
    let currentDate = new Date(today);

    for (let i = 0; i < milestoneConfig.numMilestones; i++) {

      const milestoneDuration = weeksPerMilestone + (i === milestoneConfig.numMilestones - 1 ? remainingWeeks : 0);
      const milestoneWeeks = milestoneDuration;
      
      const milestoneStartDate = new Date(currentDate);
      const milestoneEndDate = new Date(currentDate);
      milestoneEndDate.setDate(milestoneEndDate.getDate() + (milestoneWeeks * 7));

      const tasks = [];
      const hoursPerTask = Math.floor((timePerWeek * milestoneWeeks) / milestoneConfig.taskTemplates[i].length);

      for (let j = 0; j < milestoneConfig.taskTemplates[i].length; j++) {
        tasks.push({
          name: milestoneConfig.taskTemplates[i][j],
          estimatedHours: hoursPerTask,
          startDate: milestoneStartDate,
          endDate: new Date(milestoneStartDate.getTime() + (hoursPerTask / timePerWeek) * 7 * 24 * 60 * 60 * 1000)
        });
      }

      milestones.push({
        name: milestoneConfig.milestoneNames[i],
        startDate: milestoneStartDate,
        endDate: milestoneEndDate,
        weeksDuration: milestoneWeeks,
        tasks: tasks
      });

      currentDate = new Date(milestoneEndDate);
    }

    return {
      success: true,
      totalWeeks: totalWeeks,
      totalHours: totalHoursAvailable,
      milestonesCount: milestoneConfig.numMilestones,
      milestones: milestones
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { generateRoadmap };