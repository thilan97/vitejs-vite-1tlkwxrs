import { createClient } from '@supabase/supabase-js'

const URL = 'https://uzloxzrqtzuucxlokqfm.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bG94enJxdHp1dWN4bG9rcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODAwOTYsImV4cCI6MjA5MTA1NjA5Nn0.INA68j0bmDb7kFtn4H3TiQmPzEqs67sKMsBhc--mvvo' // anon key của bạn

export const db = createClient(URL, KEY)