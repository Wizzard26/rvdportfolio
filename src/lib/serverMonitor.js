import mongoose from 'mongoose';

const serverMonitorSchema = new mongoose.Schema({
    servername: { type: String, required: true },
    url: { type: String, required: true },
    owner: [{
        firstname: { type: String },
        lastname: { type: String }
    }]
});

const ServerMonitor = mongoose.models.ServerMonitor || mongoose.model('ServerMonitor', serverMonitorSchema );

export default ServerMonitor;