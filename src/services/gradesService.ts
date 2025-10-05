import { getApiUrl } from '../config/api';

export type GradeRow = {
  id: string;
  subject: string;
  courseCode?: string;
  units: number;
  grade: number;
  semester: string;
};

class GradesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl('GET_GRADES').replace('/get', '');
  }

  async getUserGrades(userId: number): Promise<GradeRow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grades || [];
    } catch (error) {
      console.error('Error fetching user grades:', error);
      throw error;
    }
  }

  async updateUserGrades(userId: number, grades: GradeRow[]): Promise<GradeRow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/update/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grades || [];
    } catch (error) {
      console.error('Error updating user grades:', error);
      throw error;
    }
  }

  async addUserGrade(userId: number, grade: GradeRow): Promise<GradeRow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/add/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grades || [];
    } catch (error) {
      console.error('Error adding user grade:', error);
      throw error;
    }
  }

  async deleteUserGrade(userId: number, gradeId: string): Promise<GradeRow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade_id: gradeId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grades || [];
    } catch (error) {
      console.error('Error deleting user grade:', error);
      throw error;
    }
  }
}

export const gradesService = new GradesService();
