task :deploy do |t|
  sh "git push origin main"
  sh "rsync -auP --no-p --exclude-from='rsync-exclude.txt' . $NEBYOODLE_REMOTE"
end

task :default => [:deploy]
