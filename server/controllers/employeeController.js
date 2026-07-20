import Employee from '../models/Employee.js';

// @desc    Get all employees or search by name/phone/designation
// @route   GET /api/employees
// @access  Public (Protected)
export const getEmployees = async (req, res, next) => {
  try {
    const { query } = req.query;
    let filter = {};

    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { designation: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      };
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    console.log(`[Employee Controller] [FETCH] Collection: employees | Retrieved ${employees.length} records.`);
    res.status(200).json(employees);
  } catch (error) {
    console.error('[Employee Controller] [ERROR] Fetching employees failed:', error);
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Public (Protected)
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee record not found');
    }

    console.log(`[Employee Controller] [FETCH_BY_ID] Collection: employees | ID: ${employee._id}`);
    res.status(200).json(employee);
  } catch (error) {
    console.error('[Employee Controller] [ERROR] Fetching employee by ID failed:', error);
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req, res, next) => {
  try {
    const { name, phone, email, designation, salary, joiningDate, address, status, profilePhoto } = req.body;

    if (!name || !phone || !email || !designation || salary === undefined) {
      res.status(400);
      throw new Error('Name, phone, email, designation, and salary are required');
    }

    const employee = await Employee.create({
      name,
      phone,
      email,
      designation,
      salary: parseFloat(salary) || 0,
      joiningDate: joiningDate || undefined,
      address: address || 'Address not provided',
      status: status || 'Active',
      profilePhoto: profilePhoto || undefined,
    });

    console.log(`[Employee Controller] [INSERT] Collection: employees | Document Created | ID: ${employee._id} | Name: "${employee.name}"`);
    res.status(201).json(employee);
  } catch (error) {
    console.error('[Employee Controller] [ERROR] Employee creation failed:', error);
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      res.status(404);
      throw new Error('Employee record not found');
    }

    console.log(`[Employee Controller] [UPDATE] Collection: employees | Document Updated | ID: ${employee._id}`);
    res.status(200).json(employee);
  } catch (error) {
    console.error('[Employee Controller] [ERROR] Employee update failed:', error);
    next(error);
  }
};

// @desc    Delete employee record
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee record not found');
    }

    console.log(`[Employee Controller] [DELETE] Collection: employees | Document Deleted | ID: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Employee record successfully deleted' });
  } catch (error) {
    console.error('[Employee Controller] [ERROR] Employee deletion failed:', error);
    next(error);
  }
};
