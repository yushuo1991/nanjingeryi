# Context Usage Examples

This document provides comprehensive examples of how to use the Context API in the RehabCareLink application.

## Table of Contents

1. [AuthContext](#authcontext)
2. [PatientContext](#patientcontext)
3. [UIContext](#uicontext)
4. [Combined Usage](#combined-usage)

---

## AuthContext

### Basic Usage

```jsx
import { useAuth } from '../contexts';

function UserProfile() {
  const { user, userRole, isTherapist, isDoctor, switchRole } = useAuth();

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Role: {userRole}</p>

      <button onClick={() => switchRole('therapist')}>
        Switch to Therapist
      </button>
      <button onClick={() => switchRole('doctor')}>
        Switch to Doctor
      </button>
    </div>
  );
}
```

### Role-Based Rendering

```jsx
import { useAuth } from '../contexts';

function ActionButtons() {
  const { isTherapist, isDoctor } = useAuth();

  return (
    <div>
      {isTherapist && (
        <button>Add Treatment Log</button>
      )}

      {isDoctor && (
        <button>View Reports Only</button>
      )}
    </div>
  );
}
```

### Login/Logout

```jsx
import { useAuth } from '../contexts';

function LoginForm() {
  const { login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      username: 'therapist1',
      password: 'password123',
      role: 'therapist'
    });

    if (result.success) {
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
}
```

---

## PatientContext

### Fetching Patients

```jsx
import { usePatients } from '../contexts';
import { useEffect } from 'react';

function PatientList() {
  const { patients, loading, error, fetchPatients } = usePatients();

  useEffect(() => {
    // Fetch all patients
    fetchPatients();

    // Or fetch by department
    // fetchPatients({ departmentId: 1 });

    // Or fetch by status
    // fetchPatients({ status: 'active' });
  }, [fetchPatients]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {patients.map(patient => (
        <li key={patient.id}>{patient.name}</li>
      ))}
    </ul>
  );
}
```

### Creating a Patient

```jsx
import { usePatients } from '../contexts';
import { useUI } from '../contexts';

function CreatePatientForm() {
  const { createPatient } = usePatients();
  const { showSuccess, showError } = useUI();

  const handleSubmit = async (formData) => {
    const newPatient = await createPatient({
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      departmentId: formData.departmentId,
      diagnosis: formData.diagnosis,
      // ... other fields
    });

    if (newPatient) {
      showSuccess('Patient created successfully!');
    } else {
      showError('Failed to create patient');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Updating a Patient

```jsx
import { usePatients } from '../contexts';

function EditPatientForm({ patientId }) {
  const { updatePatient, selectedPatient } = usePatients();

  const handleUpdate = async (updates) => {
    const updated = await updatePatient(patientId, {
      name: updates.name,
      diagnosis: updates.diagnosis,
      // ... other fields
    });

    if (updated) {
      console.log('Patient updated:', updated);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields */}
    </form>
  );
}
```

### Deleting a Patient

```jsx
import { usePatients } from '../contexts';
import { useUI } from '../contexts';

function DeletePatientButton({ patientId }) {
  const { deletePatient } = usePatients();
  const { showSuccess, showError, openModal } = useUI();

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure?');
    if (!confirmed) return;

    const success = await deletePatient(patientId);

    if (success) {
      showSuccess('Patient deleted successfully');
    } else {
      showError('Failed to delete patient');
    }
  };

  return (
    <button onClick={handleDelete}>Delete Patient</button>
  );
}
```

### Adding Treatment Log

```jsx
import { usePatients } from '../contexts';

function AddTreatmentLog({ patientId }) {
  const { addTreatmentLog } = usePatients();

  const handleAddLog = async () => {
    const log = await addTreatmentLog(patientId, {
      date: new Date().toISOString(),
      content: 'Treatment session completed',
      therapist: 'Dr. Smith',
      duration: 60,
      notes: 'Patient showed improvement',
    });

    if (log) {
      console.log('Log added:', log);
    }
  };

  return (
    <button onClick={handleAddLog}>Add Treatment Log</button>
  );
}
```

### Using Helper Methods

```jsx
import { usePatients } from '../contexts';

function DepartmentStats({ departmentId }) {
  const {
    getPatientsByDepartment,
    getTodayTreatedCount,
    getPendingCount
  } = usePatients();

  const deptPatients = getPatientsByDepartment(departmentId);
  const treatedCount = getTodayTreatedCount(departmentId);
  const pendingCount = getPendingCount(departmentId);

  return (
    <div>
      <p>Total Patients: {deptPatients.length}</p>
      <p>Treated Today: {treatedCount}</p>
      <p>Pending: {pendingCount}</p>
    </div>
  );
}
```

---

## UIContext

### Navigation

```jsx
import { useUI, PAGES } from '../contexts';

function Navigation() {
  const { currentPage, navigateTo } = useUI();

  return (
    <nav>
      <button
        onClick={() => navigateTo(PAGES.HOME)}
        className={currentPage === PAGES.HOME ? 'active' : ''}
      >
        Home
      </button>
      <button
        onClick={() => navigateTo(PAGES.PATIENTS)}
        className={currentPage === PAGES.PATIENTS ? 'active' : ''}
      >
        Patients
      </button>
      <button
        onClick={() => navigateTo(PAGES.PROFILE)}
        className={currentPage === PAGES.PROFILE ? 'active' : ''}
      >
        Profile
      </button>
    </nav>
  );
}
```

### Toast Notifications

```jsx
import { useUI } from '../contexts';

function ToastExample() {
  const { showSuccess, showError, showWarning, showInfo } = useUI();

  return (
    <div>
      <button onClick={() => showSuccess('Operation successful!')}>
        Show Success
      </button>
      <button onClick={() => showError('Something went wrong!')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Please be careful!')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Here is some information')}>
        Show Info
      </button>
    </div>
  );
}
```

### Toast Component

```jsx
import { useUI, TOAST_TYPES } from '../contexts';

function ToastNotification() {
  const { toast, hideToast } = useUI();

  if (!toast) return null;

  const bgColor = {
    [TOAST_TYPES.SUCCESS]: 'bg-green-500',
    [TOAST_TYPES.ERROR]: 'bg-red-500',
    [TOAST_TYPES.WARNING]: 'bg-yellow-500',
    [TOAST_TYPES.INFO]: 'bg-blue-500',
  }[toast.type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg`}>
      <p>{toast.message}</p>
      <button onClick={hideToast}>Close</button>
    </div>
  );
}
```

### Modal Management

```jsx
import { useUI } from '../contexts';

function ModalExample() {
  const { modals, openModal, closeModal } = useUI();

  return (
    <div>
      <button onClick={() => openModal('aiIntake')}>
        Open AI Intake Modal
      </button>

      {modals.aiIntake && (
        <div className="modal">
          <h2>AI Intake</h2>
          <button onClick={() => closeModal('aiIntake')}>Close</button>
        </div>
      )}
    </div>
  );
}
```

### Loading State

```jsx
import { useUI } from '../contexts';

function LoadingExample() {
  const { loading, setLoading } = useUI();

  const handleAsyncOperation = async () => {
    setLoading(true);
    try {
      await someAsyncOperation();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      <button onClick={handleAsyncOperation}>Start Operation</button>
    </div>
  );
}
```

### Department Selection

```jsx
import { useUI } from '../contexts';

function DepartmentSelector({ departments }) {
  const { selectedDepartment, selectDepartment } = useUI();

  return (
    <div>
      {departments.map(dept => (
        <button
          key={dept.id}
          onClick={() => selectDepartment(dept)}
          className={selectedDepartment?.id === dept.id ? 'active' : ''}
        >
          {dept.name}
        </button>
      ))}
    </div>
  );
}
```

### FAB Menu

```jsx
import { useUI } from '../contexts';

function FloatingActionButton() {
  const { showFabMenu, toggleFabMenu, closeFabMenu, openModal } = useUI();

  return (
    <div>
      <button onClick={toggleFabMenu}>+</button>

      {showFabMenu && (
        <div className="fab-menu">
          <button onClick={() => {
            openModal('aiIntake');
            closeFabMenu();
          }}>
            AI Intake
          </button>
          <button onClick={() => {
            openModal('quickEntry');
            closeFabMenu();
          }}>
            Quick Entry
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Combined Usage

### Complete Patient Management Component

```jsx
import { useAuth, usePatients, useUI } from '../contexts';
import { useEffect } from 'react';

function PatientManagement() {
  const { isTherapist, isDoctor } = useAuth();
  const {
    patients,
    loading,
    fetchPatients,
    createPatient,
    deletePatient
  } = usePatients();
  const {
    showSuccess,
    showError,
    openModal,
    closeModal,
    modals
  } = useUI();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleCreatePatient = async (data) => {
    const newPatient = await createPatient(data);
    if (newPatient) {
      showSuccess('Patient created successfully!');
      closeModal('quickEntry');
    } else {
      showError('Failed to create patient');
    }
  };

  const handleDeletePatient = async (patientId) => {
    const success = await deletePatient(patientId);
    if (success) {
      showSuccess('Patient deleted successfully!');
    } else {
      showError('Failed to delete patient');
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div>
      <h1>Patient Management</h1>

      {isTherapist && (
        <button onClick={() => openModal('quickEntry')}>
          Add New Patient
        </button>
      )}

      <ul>
        {patients.map(patient => (
          <li key={patient.id}>
            {patient.name} - {patient.diagnosis}
            {isTherapist && (
              <button onClick={() => handleDeletePatient(patient.id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {modals.quickEntry && (
        <div className="modal">
          <h2>Add New Patient</h2>
          {/* Form component here */}
          <button onClick={() => closeModal('quickEntry')}>Cancel</button>
        </div>
      )}
    </div>
  );
}
```

### Dashboard with All Contexts

```jsx
import { useAuth, usePatients, useUI, PAGES } from '../contexts';
import { useEffect } from 'react';

function Dashboard() {
  const { user, userRole, switchRole } = useAuth();
  const {
    patients,
    getTodayTreatedCount,
    getPendingCount,
    fetchPatients
  } = usePatients();
  const {
    navigateTo,
    selectedDepartment,
    showSuccess
  } = useUI();

  useEffect(() => {
    fetchPatients({
      departmentId: selectedDepartment?.id
    });
  }, [fetchPatients, selectedDepartment]);

  const treatedCount = getTodayTreatedCount(selectedDepartment?.id);
  const pendingCount = getPendingCount(selectedDepartment?.id);

  return (
    <div>
      <header>
        <h1>Welcome, {user.name}</h1>
        <p>Role: {userRole}</p>
        <button onClick={() => switchRole(
          userRole === 'therapist' ? 'doctor' : 'therapist'
        )}>
          Switch Role
        </button>
      </header>

      <div className="stats">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p>{patients.length}</p>
        </div>
        <div className="stat-card">
          <h3>Treated Today</h3>
          <p>{treatedCount}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p>{pendingCount}</p>
        </div>
      </div>

      <button onClick={() => navigateTo(PAGES.PATIENTS)}>
        View All Patients
      </button>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use Hooks Inside Components

```jsx
// ✅ Good
function MyComponent() {
  const { user } = useAuth();
  return <div>{user.name}</div>;
}

// ❌ Bad - Don't use hooks outside components
const { user } = useAuth();
function MyComponent() {
  return <div>{user.name}</div>;
}
```

### 2. Handle Loading and Error States

```jsx
function PatientList() {
  const { patients, loading, error, fetchPatients } = usePatients();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (patients.length === 0) return <EmptyState />;

  return (
    <ul>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </ul>
  );
}
```

### 3. Use Callbacks for Event Handlers

```jsx
function PatientActions({ patientId }) {
  const { updatePatient } = usePatients();
  const { showSuccess } = useUI();

  const handleUpdate = useCallback(async (data) => {
    const updated = await updatePatient(patientId, data);
    if (updated) {
      showSuccess('Updated successfully!');
    }
  }, [patientId, updatePatient, showSuccess]);

  return <button onClick={handleUpdate}>Update</button>;
}
```

### 4. Combine Multiple Contexts

```jsx
function SmartComponent() {
  const { isTherapist } = useAuth();
  const { patients, createPatient } = usePatients();
  const { showSuccess, openModal } = useUI();

  // Use all contexts together
  const handleAction = async () => {
    if (!isTherapist) {
      showError('Only therapists can perform this action');
      return;
    }

    const patient = await createPatient(data);
    if (patient) {
      showSuccess('Patient created!');
      openModal('patientDetail');
    }
  };

  return <button onClick={handleAction}>Create Patient</button>;
}
```

---

## Migration Guide

### Before (Props Drilling)

```jsx
function App() {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState('therapist');

  return (
    <Dashboard
      patients={patients}
      setPatients={setPatients}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userRole={userRole}
      setUserRole={setUserRole}
    />
  );
}

function Dashboard({ patients, setPatients, currentPage, setCurrentPage, userRole, setUserRole }) {
  return (
    <PatientList
      patients={patients}
      setPatients={setPatients}
      userRole={userRole}
    />
  );
}
```

### After (Context API)

```jsx
function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <PatientProvider>
          <Dashboard />
        </PatientProvider>
      </UIProvider>
    </AuthProvider>
  );
}

function Dashboard() {
  return <PatientList />;
}

function PatientList() {
  const { patients } = usePatients();
  const { userRole } = useAuth();

  // Direct access to context, no props needed!
  return <div>{/* ... */}</div>;
}
```

---

## Performance Tips

1. **Use useMemo for expensive computations**
2. **Use useCallback for event handlers**
3. **Split contexts by concern** (Auth, Patient, UI are separate)
4. **Avoid unnecessary re-renders** by selecting only needed values
5. **Use silent loading** for background updates

```jsx
// Silent refresh without showing loading spinner
fetchPatients({ silent: true });
```
