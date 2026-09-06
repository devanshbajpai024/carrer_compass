const mongoose = require('mongoose');
const Opportunity = require('./src/models/Opportunity');
mongoose.connect('mongodb://localhost:27017/career_compass').then(async () => {
    const opps = await Opportunity.find({});
    console.log('Total:', opps.length);
    const hasPython = await Opportunity.find({ 'skills.skill': /python/i });
    console.log('Python matches:', hasPython.length);
    if(hasPython.length > 0) console.log(hasPython[0].skills);
    process.exit();
}).catch(console.log);
