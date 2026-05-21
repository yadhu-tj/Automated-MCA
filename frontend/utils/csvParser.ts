import { Member, Role } from '../types';

export const parseCSV = (file: File): Promise<Member[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("File is empty or could not be read."));
        return;
      }

      try {
        const lines = text.split(/\r\n|\n/);
        if (lines.length < 2) {
          reject(new Error("CSV file is empty or missing headers"));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const newMembers: Member[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const memberObj: any = {
            id: `csv-${Date.now()}-${i}`,
            photoUrl: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(values[0] || 'User')}`,
            role: Role.STUDENT,
            department: 'MCA'
          };

          let hasName = false;
          headers.forEach((header, idx) => {
            const val = values[idx];
            if (!val) return;
            if (header.includes('name')) { memberObj.name = val; hasName = true; }
            else if (header.includes('email')) memberObj.email = val;
            else if (header.includes('role')) {
              if (val.toLowerCase().includes('faculty')) memberObj.role = Role.FACULTY;
              else if (val.toLowerCase().includes('alumni')) memberObj.role = Role.ALUMNI;
              else if (val.toLowerCase().includes('admin')) memberObj.role = Role.ADMIN;
              else memberObj.role = Role.STUDENT;
            }
            else if (header.includes('department') || header.includes('dept')) memberObj.department = val;
            else if (header.includes('dob') || header.includes('birth')) memberObj.dob = val;
            else if (header.includes('whatsapp') || header.includes('phone')) memberObj.whatsappNumber = val;
            else if (header.includes('year') || header.includes('batch')) memberObj.year = val;
          });

          if (hasName) newMembers.push(memberObj as Member);
        }

        resolve(newMembers);

      } catch (err) {
        console.error(err);
        reject(new Error("Error parsing CSV file."));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsText(file);
  });
};
