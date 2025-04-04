const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({ ... });

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
