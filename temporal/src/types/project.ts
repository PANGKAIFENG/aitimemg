export interface Project {
    id: string;
    name: string;
    color: string;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
}
