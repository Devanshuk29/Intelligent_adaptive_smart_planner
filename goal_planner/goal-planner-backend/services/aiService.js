const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const generateStudyPlan = async (topicName, currentConfidence, timePerWeek, weeksRemaining) => {
  try {
    if (!topicName || currentConfidence === undefined) {
      return {
        success: false,
        error: 'topicName and currentConfidence are required'
      };
    }

    const prompt = `You are an expert educational advisor. Generate a detailed, personalized study plan.

Topic: ${topicName}
Current Confidence Level: ${currentConfidence}%
Time Available: ${timePerWeek || 10} hours per week
Time Remaining: ${weeksRemaining || 4} weeks

Please provide:
1. Learning Strategy (2-3 sentences)
2. Key Concepts to Master (5-7 bullet points)
3. Practice Approach (2-3 bullet points)
4. Estimated Time Breakdown (by concept)
5. Success Tips (3-4 bullet points)

Format your response clearly with headers.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const studyPlan = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      success: true,
      topic: topicName,
      studyPlan: studyPlan,
      confidence: currentConfidence,
      timePerWeek: timePerWeek,
      weeksRemaining: weeksRemaining
    };

  } catch (error) {
    console.error('Generate study plan error:', error.message);
    return {
      success: false,
      error: 'Failed to generate study plan'
    };
  }
};

const generatePracticeProblems = async (topicName, difficulty, count = 5) => {
  try {
    if (!topicName || !difficulty) {
      return {
        success: false,
        error: 'topicName and difficulty are required'
      };
    }

    const prompt = `Generate ${count} practice problems for ${topicName} at ${difficulty} level.

For each problem:
1. Problem statement
2. Example input
3. Example output
4. Hints (2-3 hints)
5. Concepts tested

Format as a numbered list with clear sections.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const problems = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      success: true,
      topic: topicName,
      difficulty: difficulty,
      count: count,
      problems: problems
    };

  } catch (error) {
    console.error('Generate practice problems error:', error.message);
    return {
      success: false,
      error: 'Failed to generate practice problems'
    };
  }
};

const getLearningTips = async (topicName, currentConfidence, learningStyle = 'visual') => {
  try {
    if (!topicName || currentConfidence === undefined) {
      return {
        success: false,
        error: 'topicName and currentConfidence are required'
      };
    }

    const prompt = `You are a learning coach. Provide personalized tips for studying ${topicName}.

Current Understanding: ${currentConfidence}%
Preferred Learning Style: ${learningStyle}

Provide:
1. Top 3 Learning Strategies for ${learningStyle} learners
2. Common Mistakes to Avoid (3 points)
3. Real-world Applications (2-3 examples)
4. Resources Recommendation (types of resources)
5. Progress Checkpoints (how to know you're learning)

Be specific and actionable.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const tips = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      success: true,
      topic: topicName,
      confidence: currentConfidence,
      learningStyle: learningStyle,
      tips: tips
    };

  } catch (error) {
    console.error('Get learning tips error:', error.message);
    return {
      success: false,
      error: 'Failed to generate learning tips'
    };
  }
};

const analyzeProgress = async (topicName, previousConfidence, currentConfidence, studyHours, tasksCompleted) => {
  try {
    if (!topicName || previousConfidence === undefined || currentConfidence === undefined) {
      return {
        success: false,
        error: 'topicName, previousConfidence, and currentConfidence are required'
      };
    }

    const improvement = currentConfidence - previousConfidence;

    const prompt = `Analyze learning progress and provide feedback.

Topic: ${topicName}
Previous Confidence: ${previousConfidence}%
Current Confidence: ${currentConfidence}%
Improvement: ${improvement}%
Study Hours: ${studyHours || 'N/A'}
Tasks Completed: ${tasksCompleted || 'N/A'}

Please provide:
1. Progress Assessment (is improvement good/slow/excellent?)
2. What's Working Well (2-3 points)
3. Areas for Improvement (2-3 points)
4. Recommended Adjustments to Study Approach (2-3 suggestions)
5. Motivation & Next Steps (encouragement + what to do next)

Be encouraging but honest.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      success: true,
      topic: topicName,
      improvement: improvement,
      analysis: analysis
    };

  } catch (error) {
    console.error('Analyze progress error:', error.message);
    return {
      success: false,
      error: 'Failed to analyze progress'
    };
  }
};

module.exports = { generateStudyPlan, generatePracticeProblems, getLearningTips, analyzeProgress };