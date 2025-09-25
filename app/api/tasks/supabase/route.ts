import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Task, TaskPriority, TaskStatus } from '@/types/task'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const bucketId = searchParams.get('bucketId')

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        created_by_user:created_by (
          id,
          email,
          raw_user_meta_data
        ),
        assigned_to_user:assigned_to (
          id,
          email,
          raw_user_meta_data
        )
      ` as any)
      .order('created_at', { ascending: false })

    // Filter by organization (required for RLS)
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    // Additional filters
    if (status) {
      query = query.eq('status', status)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    // Filter by bucket if specified
    if (bucketId) {
      query = supabase
        .from('tasks')
        .select(`
          *,
          created_by_user:created_by (
            id,
            email,
            raw_user_meta_data
          ),
          assigned_to_user:assigned_to (
            id,
            email,
            raw_user_meta_data
          ),
          task_buckets!inner(bucket_id)
        ` as any)
        .eq('task_buckets.bucket_id', bucketId)
        .order('created_at', { ascending: false })
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Transform data to match our Task interface
    const transformedTasks: Task[] = tasks?.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.due_date,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      category: task.category,
      location: task.location,
      assignedTo: task.assigned_to_user?.raw_user_meta_data?.name || task.assigned_to_user?.email,
      notes: task.notes,
      createdBy: task.created_by_user?.raw_user_meta_data?.name || task.created_by_user?.email,
      startedAt: task.started_at ? new Date(task.started_at) : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      completedBy: task.completed_by,
    })) || []

    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.organizationId) {
      return NextResponse.json(
        { error: 'Title and organizationId are required' },
        { status: 400 }
      )
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: body.title,
        description: body.description,
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        due_date: body.dueDate,
        organization_id: body.organizationId,
        created_by: user.id,
        assigned_to: body.assignedTo,
        category: body.category,
        location: body.location,
        notes: body.notes,
      } as any)
      .select(`
        *,
        created_by_user:created_by (
          id,
          email,
          raw_user_meta_data
        ),
        assigned_to_user:assigned_to (
          id,
          email,
          raw_user_meta_data
        )
      ` as any)
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // Add to bucket if specified
    if (body.bucketId) {
      await supabase
        .from('task_buckets')
        .insert({
          task_id: (task as any).id,
          bucket_id: body.bucketId,
        } as any)
    }

    // Create history entry
    await supabase
      .from('task_history')
      .insert({
        task_id: (task as any).id,
        action: 'created',
        new_value: (task as any).title,
        created_by: user.id,
      } as any)

    // Transform response
    const transformedTask: Task = {
      id: (task as any).id,
      title: (task as any).title,
      description: (task as any).description,
      priority: (task as any).priority as TaskPriority,
      status: (task as any).status as TaskStatus,
      dueDate: (task as any).due_date,
      createdAt: new Date((task as any).created_at),
      updatedAt: new Date((task as any).updated_at),
      category: (task as any).category,
      location: (task as any).location,
      assignedTo: (task as any).assigned_to_user?.raw_user_meta_data?.name || (task as any).assigned_to_user?.email,
      notes: (task as any).notes,
      createdBy: (task as any).created_by_user?.raw_user_meta_data?.name || (task as any).created_by_user?.email,
    }

    return NextResponse.json(transformedTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
