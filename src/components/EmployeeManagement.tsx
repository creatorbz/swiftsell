import { useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const savedEmployees = localStorage.getItem('pos-employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  const saveEmployees = (newEmployees: Employee[]) => {
    localStorage.setItem('pos-employees', JSON.stringify(newEmployees));
    setEmployees(newEmployees);
  };

  const handleAdd = (employee: Partial<Employee>) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      username: employee.username!,
      password: employee.password!,
      name: employee.name!,
      role: employee.role!,
      active: true,
      createdAt: Date.now(),
    };

    saveEmployees([...employees, newEmployee]);
    setShowAddForm(false);
    toast.success('Karyawan berhasil ditambahkan');
  };

  const handleEdit = (employee: Employee) => {
    saveEmployees(employees.map(e => e.id === employee.id ? employee : e));
    setEditingEmployee(null);
    toast.success('Data karyawan berhasil diperbarui');
  };

  const handleToggleActive = (id: string) => {
    if (currentUser?.id === id) {
      toast.error('Tidak dapat menonaktifkan akun sendiri');
      return;
    }
    saveEmployees(employees.map(e => 
      e.id === id ? { ...e, active: !e.active } : e
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Karyawan</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Tambah Karyawan
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map(employee => (
          <div key={employee.id} className="card p-4">
            {editingEmployee?.id === employee.id ? (
              <EmployeeForm
                employee={employee}
                onSave={handleEdit}
                onCancel={() => setEditingEmployee(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{employee.name}</h3>
                  <p className="text-sm text-gray-500">@{employee.username}</p>
                  <div className="mt-1 space-x-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      employee.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                      employee.role === 'store_manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {employee.role === 'owner' ? 'Owner' :
                       employee.role === 'store_manager' ? 'Store Manager' :
                       'Shopkeeper'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      employee.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {employee.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEmployee(employee)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(employee.id)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title={employee.active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {employee.active ? <X size={20} /> : <Check size={20} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tambah Karyawan</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <EmployeeForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: any) => void;
  onCancel: () => void;
}

function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [username, setUsername] = useState(employee?.username || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(employee?.name || '');
  const [role, setRole] = useState<UserRole>(employee?.role || 'shopkeeper');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employee && !password) {
      // If editing and password is empty, keep the old password
      onSave({ ...employee, username, name, role });
    } else {
      onSave({ username, password, name, role });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {employee ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required={!employee}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="shopkeeper">Shopkeeper</option>
          <option value="store_manager">Store Manager</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="flex-1 btn-primary justify-center">
          {employee ? 'Simpan' : 'Tambah'} Karyawan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary justify-center"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
