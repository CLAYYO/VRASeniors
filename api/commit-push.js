import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message = 'Update content via admin interface' } = req.body;

    // Change to the project directory
    const projectDir = process.cwd();
    
    // Add all changes
    await execAsync('git add .', { cwd: projectDir });
    
    // Check if there are any changes to commit
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: projectDir });
    
    if (!statusOutput.trim()) {
      return res.status(200).json({ 
        success: true, 
        message: 'No changes to commit' 
      });
    }
    
    // Commit changes
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectDir });
    
    // Push to remote
    await execAsync('git push', { cwd: projectDir });
    
    res.status(200).json({
      success: true,
      message: 'Changes committed and pushed successfully'
    });

  } catch (error) {
    console.error('Git operation error:', error);
    
    // Handle specific git errors
    let errorMessage = error.message;
    if (error.message.includes('nothing to commit')) {
      return res.status(200).json({ 
        success: true, 
        message: 'No changes to commit' 
      });
    } else if (error.message.includes('not a git repository')) {
      errorMessage = 'This project is not a git repository';
    } else if (error.message.includes('remote rejected')) {
      errorMessage = 'Push rejected by remote repository';
    } else if (error.message.includes('Permission denied')) {
      errorMessage = 'Permission denied - check your git credentials';
    }
    
    res.status(500).json({ 
      error: 'Git operation failed: ' + errorMessage 
    });
  }
}