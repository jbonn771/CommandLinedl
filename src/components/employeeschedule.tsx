import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { parse, isAfter, isBefore, differenceInMinutes } from 'date-fns';

Modal.setAppElement('#root');

const duties = ['phones', 'tier1', 'tier2', 'lunch'] as const;

type DutyType = typeof duties[number]; 

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Employee {
  _id: string;
  name: string;
  schedule: Record<string, any>;
}

interface FormData {
  tier1Start: string;
  tier1End: string;
  tier2Start: string;
  tier2End: string;
  phonesStart: string;
  phonesEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

interface SelectedCell {
  employee: Employee;
  day: string;
}

interface CountType {
    phones: number;
    tier1: number;
    tier2: number;
    lunch: number;
    [key: string]: number; // Allow other string keys
  }

const WeeklyScheduler: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedule, setSchedule] = useState<Record<string, any>>({});
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    tier1Start: '',
    tier1End: '',
    tier2Start: '',
    tier2End: '',
    phonesStart: '',
    phonesEnd: '',
    lunchStart: '',
    lunchEnd: ''
  });
  const [newEmployeeModalOpen, setNewEmployeeModalOpen] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState<string>('');
  const [currentCounts, setCurrentCounts] = useState<{
    [key: string]: number;
  }>({
    phones: 0,
    tier1: 0,
    tier2: 0,
    lunch: 0
  } as {[key: string]: number});
  const [loading, setLoading] = useState<boolean>(false);

  const employeesRef = useRef<Employee[]>([]);

  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  const parseTime = (timeStr: string) => {
    return parse(timeStr, 'HH:mm', new Date());
  };

  const getCurrentDuty = (employee: Employee, currentTime: Date, currentDay: string) => {
    if (!employee.schedule) {
      console.warn(`Employee ${employee._id} has no schedule.`);
      return null;
    }

    const scheduleForToday = employee.schedule[currentDay];
    if (!scheduleForToday) {
      console.warn(`Employee ${employee._id} has no schedule for ${currentDay}.`);
      return null;
    }

    const duties = ['phones', 'tier1', 'tier2', 'lunch'];
    for (const duty of duties) {
      const start = scheduleForToday[`${duty}Start`];
      const end = scheduleForToday[`${duty}End`];
      if (start && end) {
        const startTime = parseTime(start);
        const endTime = parseTime(end);
        if (isAfter(currentTime, startTime) && isBefore(currentTime, endTime)) {
          return duty;
        }
      }
    }

    return null;
  };

  useEffect(() => {
    const updateCurrentCounts = () => {
      const now = new Date();
      const currentDay = daysOfWeek[now.getDay()];
      const currentTime = now;
  
      let counts: CountType = { phones: 0, tier1: 0, tier2: 0, lunch: 0 };
  
      employees.forEach((employee) => {
        const duty = getCurrentDuty(employee, currentTime, currentDay);
  
        if (duty && duties.includes(duty as DutyType)) {
          counts[duty as DutyType]++;
        }
      });
  
      setCurrentCounts(counts); 
    };
  
   
    updateCurrentCounts();
    const interval = setInterval(updateCurrentCounts, 60000);
  
    
    return () => clearInterval(interval);
  }, [employees]);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/employee/employees');
        setEmployees(response.data);

        const newSchedule: Record<string, any> = {};
        response.data.forEach((employee: Employee) => {
          newSchedule[employee._id] = employee.schedule || {};
        });
        setSchedule(newSchedule);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleCellClick = (employee: Employee, day: string) => {
    setSelectedCell({ employee, day });
    setModalOpen(true);
    setFormData({
      tier1Start: '',
      tier1End: '',
      tier2Start: '',
      tier2End: '',
      phonesStart: '',
      phonesEnd: '',
      lunchStart: '',
      lunchEnd: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCell) {
      const { employee, day } = selectedCell;

      const newTimeBlock = {
        tier1Start: formData.tier1Start || "",
        tier1End: formData.tier1End || "",
        tier2Start: formData.tier2Start || "",
        tier2End: formData.tier2End || "",
        phonesStart: formData.phonesStart || "",
        phonesEnd: formData.phonesEnd || "",
        lunchStart: formData.lunchStart || "",
        lunchEnd: formData.lunchEnd || ""
      };

      setSchedule(prev => ({
        ...prev,
        [employee._id]: {
          ...prev[employee._id],
          [day]: newTimeBlock
        }
      }));

      try {
        await axios.put(`http://localhost:5000/api/employee/update-employee/${employee._id}`, {
          day: day,
          schedule: newTimeBlock
        });
        console.log('Schedule updated successfully!');
      } catch (error) {
        console.error('Error updating schedule:', error);
        alert('Failed to update schedule. Please try again.');
      }

      setModalOpen(false);
    }
  };

  const handleNewEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmployee.trim()) {
      alert('Employee name cannot be empty.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/employee/create-employee', {
        name: newEmployee.trim(),
        schedule: {
          Sunday: {},
          Monday: {},
          Tuesday: {},
          Wednesday: {},
          Thursday: {},
          Friday: {},
          Saturday: {}
        }
      });
      if (response.data._id) {
        const newEmp: Employee = {
          name: newEmployee.trim(),
          _id: response.data._id,
          schedule: {
            Sunday: {},
            Monday: {},
            Tuesday: {},
            Wednesday: {},
            Thursday: {},
            Friday: {},
            Saturday: {}
          }
        };
        setEmployees([...employees, newEmp]);
        setSchedule(prev => ({
          ...prev,
          [newEmp._id]: newEmp.schedule
        }));
        setNewEmployee('');
        setNewEmployeeModalOpen(false);
        alert('New employee added successfully!');
      } else {
        console.error('No ID returned for the new employee.');
        alert('Failed to add new employee. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new employee:', error);
      alert('Failed to add new employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (_id: string) => {
    try {
      await axios.patch(`http://localhost:5000/delete-employee/${_id}`);
      setEmployees(employees.filter(employee => employee._id !== _id));
      setSchedule(prev => {
        const updatedSchedule = { ...prev };
        delete updatedSchedule[_id];
        return updatedSchedule;
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const calculateTimePercentage = (start: string, end: string) => {
    if (!start || !end) return 0;

    const startTime = parse(start, 'HH:mm', new Date());
    const endTime = parse(end, 'HH:mm', new Date());
    const totalDayMinutes = 24 * 60;

    const scheduledMinutes = differenceInMinutes(endTime, startTime);
    return (scheduledMinutes / totalDayMinutes) * 100;
  };

  const renderScheduleCell = (employee: Employee, day: string) => {
    const daySchedule = schedule[employee._id]?.[day] || {
      tier1Start: '',
      tier1End: '',
      tier2Start: '',
      tier2End: '',
      phonesStart: '',
      phonesEnd: '',
      lunchStart: '',
      lunchEnd: ''
    };
  
    
    const renderDutyBlock = (dutyType: string, start: string, end: string, color: string) => {
      if (!start || !end) return null;
  
      const heightPercentage = calculateTimePercentage(start, end);
      return (
        <div
          key={`${dutyType}-${start}-${end}`}
          className="duty-block"
          style={{
            backgroundColor: color,
            height: `${heightPercentage}%`,
            width: '100%',
            marginBottom: '2px',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.75rem',
            borderRadius: '4px'
          }}
          title={`${dutyType}: ${start} - ${end}`}
        >
          {`${dutyType}: ${start} - ${end}`}
        </div>
      );
    };
  
    return (
      <td
        key={`${employee._id}-${day}`}
        onClick={() => handleCellClick(employee, day)}
        className="border p-2 cursor-pointer hover:bg-gray-200"
      >
        <div className="h-full relative flex flex-col">
          {renderDutyBlock('Lunch', daySchedule.lunchStart, daySchedule.lunchEnd, '#e74c3c')}
          {renderDutyBlock('Tier 1', daySchedule.tier1Start, daySchedule.tier1End, '#3498db')}
          {renderDutyBlock('Tier 2', daySchedule.tier2Start, daySchedule.tier2End, '#f39c12')}
          {renderDutyBlock('Phones', daySchedule.phonesStart, daySchedule.phonesEnd, '#2ecc71')}
        </div>
      </td>
    );
  };
  
  const renderCurrentCounts = () => (
    <div className="grid grid-cols-4 gap-4 my-4">
      {duties.map((duty, index) => (
        <div
          key={duty}
          className={`p-4 rounded-lg shadow-lg text-white transform transition-all hover:scale-105 ${
            index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        >
          <h4 className="text-lg font-semibold mb-1">{duty.charAt(0).toUpperCase() + duty.slice(1)}</h4>
          <p className="text-3xl font-bold">{currentCounts[duty]}</p>
        </div>
      ))}
    </div>
  );

return (
  <div className="weekly-scheduler p-8 bg-gray-50 min-h-screen rounded-lg shadow-md">
  <h2 className="text-3xl font-bold text-gray-900 mb-6">Weekly Scheduler</h2>

  {renderCurrentCounts()}

  {loading ? (
    <p className="text-lg text-gray-700">Loading employees...</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800 text-white text-sm uppercase tracking-wider">
            <th className="p-4">Employee</th>
            {daysOfWeek.map(day => (
              <th key={day} className="p-4">{day}</th>
            ))}
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee._id} className="border-b last:border-none">
              <td className="p-4 text-gray-800 font-medium">{employee.name || 'Unnamed Employee'}</td>
              {daysOfWeek.map(day => (
                <React.Fragment key={`${employee._id}-${day}`}>
                  {renderScheduleCell(employee, day)}
                </React.Fragment>
              ))}
              <td className="p-4 text-center">
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  onClick={() => handleDeleteEmployee(employee._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={daysOfWeek.length + 2} className="text-center py-4">
              <button
                className="bg-[#FF4998] text-white px-6 py-2 rounded-lg hover:bg-[#ff3b8a] transition"
                onClick={() => setNewEmployeeModalOpen(true)}
              >
                + Add Employee
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )}

  <Modal
    isOpen={newEmployeeModalOpen}
    onRequestClose={() => setNewEmployeeModalOpen(false)}
    contentLabel="New Employee"
    className="scheduler-modal rounded-lg shadow-lg p-6 bg-white w-96 mx-auto"
    overlayClassName="scheduler-overlay fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
    closeTimeoutMS={300}
    portalClassName="scheduler-modal-exit"
  >
    <h2 className="text-2xl font-semibold mb-6">Add New Employee</h2>
    <form onSubmit={handleNewEmployeeSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Employee Name:</label>
        <input
          type="text"
          value={newEmployee}
          onChange={(e) => setNewEmployee(e.target.value)}
          className="border rounded-lg px-3 py-2 mt-1 w-full"
        />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
          onClick={() => setNewEmployeeModalOpen(false)}
        >
          Close
        </button>
        <button
          type="submit"
          className="bg-[#FF4998] text-white px-4 py-2 rounded-lg hover:bg-[#ff3b8a] transition"
        >
          Add Employee
        </button>
      </div>
    </form>
  </Modal>
</div>
);

}

export default WeeklyScheduler;
