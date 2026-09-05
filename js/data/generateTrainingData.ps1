# generateTrainingData.ps1 – PowerShell script to generate synthetic training data
# Deterministic random generator (Xorshift) with fixed seed for reproducibility
# Deterministic random generator using System.Random with fixed seed for reproducibility
$seed = 123456
$rand = New-Object System.Random($seed)
function Next-Double {
    return $rand.NextDouble()
}
function Choice([array]$arr) {
    $idx = [math]::Floor((Next-Double) * $arr.Length)
    return $arr[$idx]
}

# Opportunity definitions (mirroring js/data/opportunities.js)
$opportunities = @(
    @{ id=1; title='Web Developer Intern'; organization='Example Corp'; requiredSkills=@('HTML','CSS','JavaScript','React'); category='Internship'; careerField='Web Development'; eligibility='Open'; location='Remote'; experienceRequired=0; interests=@('Web Development') },
    @{ id=2; title='Frontend Engineer'; organization='TechStart'; requiredSkills=@('HTML','CSS','JavaScript','Vue.js'); category='Full-time'; careerField='Web Development'; eligibility='Open'; location='Onsite'; experienceRequired=1; interests=@('Web Development') },
    @{ id=3; title='Data Analyst Intern'; organization='DataWorks'; requiredSkills=@('SQL','Excel','Python'); category='Internship'; careerField='Data Science'; eligibility='Open'; location='Remote'; experienceRequired=0; interests=@('Data Analysis') },
    @{ id=4; title='Machine Learning Engineer'; organization='AI Labs'; requiredSkills=@('Python','TensorFlow','Data Science'); category='Full-time'; careerField='AI'; eligibility='Open'; location='Onsite'; experienceRequired=2; interests=@('Machine Learning') },
    @{ id=5; title='Backend Developer Intern'; organization='ServerSide'; requiredSkills=@('Node.js','Express','JavaScript'); category='Internship'; careerField='Backend Development'; eligibility='Open'; location='Remote'; experienceRequired=0; interests=@('Backend Development') },
    @{ id=6; title='Full Stack Developer'; organization='Stackify'; requiredSkills=@('HTML','CSS','JavaScript','React','Node.js'); category='Full-time'; careerField='Web Development'; eligibility='Open'; location='Remote'; experienceRequired=1; interests=@('Web Development') },
    @{ id=7; title='Mobile App Intern'; organization='AppMakers'; requiredSkills=@('Java','Android','Git'); category='Internship'; careerField='Mobile Development'; eligibility='Open'; location='Remote'; experienceRequired=0; interests=@('Mobile Apps') },
    @{ id=8; title='UX Designer'; organization='DesignHub'; requiredSkills=@('Figma','User Research'); category='Full-time'; careerField='Design'; eligibility='Open'; location='Onsite'; experienceRequired=1; interests=@('Design') },
    @{ id=9; title='DevOps Engineer'; organization='CloudOps'; requiredSkills=@('Docker','Kubernetes','CI/CD'); category='Full-time'; careerField='DevOps'; eligibility='Open'; location='Remote'; experienceRequired=2; interests=@('Infrastructure') },
    @{ id=10; title='Product Manager Intern'; organization='ProductCo'; requiredSkills=@('Communication','Agile'); category='Internship'; careerField='Product Management'; eligibility='Open'; location='Onsite'; experienceRequired=0; interests=@('Product') }
)

# Pools
$skillPool = $opportunities | ForEach-Object { $_.requiredSkills } | Select-Object -Unique
$interestPool = $opportunities | ForEach-Object { $_.interests } | Select-Object -Unique
$careerFieldPool = $opportunities | ForEach-Object { $_.careerField } | Select-Object -Unique
$educationPool = @('B.Tech','M.Tech','B.Sc','M.Sc','BS Computer Science')
$eligibilityPool = @('Open','Restricted')
$locationPool = @('Remote','Onsite')

# Determine student counts per split (same as JS version)
$oppCount = $opportunities.Count
$TRAIN_ROWS = 1000
$VAL_ROWS = 200
$TEST_ROWS = 200
$TRAIN_STUDENTS = [math]::Ceiling($TRAIN_ROWS / $oppCount)   # 100
$VAL_STUDENTS   = [math]::Ceiling($VAL_ROWS   / $oppCount)   # 20
$TEST_STUDENTS  = [math]::Ceiling($TEST_ROWS  / $oppCount)   # 20
$TOTAL_STUDENTS = $TRAIN_STUDENTS + $VAL_STUDENTS + $TEST_STUDENTS   # 140

# ----- Generate students -----
$students = @()
for ($i = 1; $i -le $TOTAL_STUDENTS; $i++) {
    $careerGoal = Choice $careerFieldPool
    $relatedOpp = $opportunities | Where-Object { $_.careerField -eq $careerGoal } | Select-Object -First 1
    if (-not $relatedOpp) { $relatedOpp = Choice $opportunities }
    $baseSkills = $relatedOpp.requiredSkills
    $keptSkills = @()
    foreach ($s in $baseSkills) { if ((Next-Double) -lt 0.8) { $keptSkills += $s } }
    $extraSkills = @()
    $extraCount = [math]::Floor((Next-Double) * 5)
    for ($e = 0; $e -lt $extraCount; $e++) {
        $cand = Choice $skillPool
        if ($keptSkills -notcontains $cand -and $extraSkills -notcontains $cand) { $extraSkills += $cand }
    }
    $skills = $keptSkills + $extraSkills
    $interests = @()
    if ((Next-Double) -lt 0.7) { $interests += $relatedOpp.interests } else { $interests += Choice $interestPool }
    $student = [pscustomobject]@{
        student_id = $i
        student_skills = ($skills -join ';')
        student_interests = ((,$interests | Select-Object -Unique) -join ';')
        career_goal = $careerGoal
        education = Choice $educationPool
        experience = [math]::Floor((Next-Double) * 5) # 0‑4 years
        location_preference = Choice $locationPool
        eligibility = Choice $eligibilityPool
    }
    $students += $student
}

# ----- Split students -----
# Shuffle students deterministically using Get-Random
$shuffled = $students | Sort-Object { Get-Random }
# Define class distribution with string keys for JSON serialization
$classDist = @{'0'=0;'1'=0;'2'=0;'3'=0;'4'=0}
$trainStudents = $shuffled[0..($TRAIN_STUDENTS-1)]
$valStudents   = $shuffled[$TRAIN_STUDENTS..($TRAIN_STUDENTS+$VAL_STUDENTS-1)]
$testStudents  = $shuffled[($TRAIN_STUDENTS+$VAL_STUDENTS)..($TOTAL_STUDENTS-1)]

function Build-Rows([array]$studentSet) {
    $rows = @()
    foreach ($stu in $studentSet) {
        foreach ($opp in $opportunities) {
            # ----- Derived features -----
            # Compute a deterministic skill match percentage based on overlap of skill strings
            $stuSkills = $stu.student_skills -split ';'
            $oppSkills = $opp.requiredSkills
            $matched = $stuSkills | Where-Object { $oppSkills -contains $_ }
            $skillMatchPct = [math]::Round(($matched.Count / $oppSkills.Count) * 100)
            $number_of_matched_skills = $matched.Count
            $number_of_missing_skills = $oppSkills.Count - $matched.Count
            $interest_match = $opp.interests | Where-Object { $stu.student_interests -like "*$($_)*" } | Measure-Object | Select-Object -ExpandProperty Count
            $interest_match = if ($interest_match -gt 0) { 1 } else { 0 }
            $career_goal_match = if ($stu.career_goal -ieq $opp.careerField) { 1 } else { 0 }
            $eligibility_match = if ($opp.eligibility -eq 'Open' -or $opp.eligibility -ieq $stu.eligibility) { 1 } else { 0 }
            $location_match = if ( ($stu.location_preference -eq 'Remote' -and $opp.location -eq 'Remote') -or
                                 ($stu.location_preference -ne 'Remote' -and $opp.location -ne 'Remote' -and $stu.location_preference -eq $opp.location) ) { 1 } else { 0 }
            $experience_match = if ($stu.experience -ge $opp.experienceRequired) { 1 } else { 0 }
            # ----- Label rules -----
            if (-not $eligibility_match) { $label = 0 }
            else {
                $expOk = $experience_match -eq 1
                if ($skillMatchPct -ge 70 -and $interest_match -eq 1 -and $career_goal_match -eq 1 -and $expOk) { $label = 4 }
                elseif ($skillMatchPct -ge 60) {
                    $sum = $interest_match + $career_goal_match + ([int]$expOk)
                    if ($sum -ge 2) { $label = 3 } else { $label = 2 }
                }
                elseif ($skillMatchPct -ge 40) { $label = 2 }
                elseif ($skillMatchPct -ge 20) { $label = 1 }
                else { $label = 0 }
            }
            $row = [pscustomobject]@{
                student_id = $stu.student_id
                student_skills = $stu.student_skills
                student_interests = $stu.student_interests
                career_goal = $stu.career_goal
                education = $stu.education
                experience = $stu.experience
                location_preference = $stu.location_preference
                eligibility = $stu.eligibility
                opportunity_id = $opp.id
                required_skills = ($opp.requiredSkills -join ';')
                opportunity_interests = ($opp.interests -join ';')
                career_field = $opp.careerField
                opportunity_type = $opp.category
                opportunity_location = $opp.location
                experience_required = $opp.experienceRequired
                opportunity_eligibility = $opp.eligibility
                skill_match_percentage = $skillMatchPct
                number_of_matched_skills = $number_of_matched_skills
                number_of_missing_skills = $number_of_missing_skills
                interest_match = $interest_match
                career_goal_match = $career_goal_match
                eligibility_match = $eligibility_match
                location_match = $location_match
                experience_match = $experience_match
                label = $label
            }
            $rows += $row
        }
    }
    return $rows
}

$trainRows = Build-Rows $trainStudents
$valRows   = Build-Rows $valStudents
$testRows  = Build-Rows $testStudents

# ----- Write CSV files -----
$dataDir = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) -ChildPath '..\..\data'
if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }

$trainRows | Export-Csv -Path (Join-Path $dataDir 'recommendation_training.csv') -NoTypeInformation -Encoding UTF8
$valRows   | Export-Csv -Path (Join-Path $dataDir 'recommendation_validation.csv') -NoTypeInformation -Encoding UTF8
$testRows  | Export-Csv -Path (Join-Path $dataDir 'recommendation_test.csv') -NoTypeInformation -Encoding UTF8

# ----- Metadata -----
# ----- Metadata -----
$allLabels = $trainRows.label + $valRows.label + $testRows.label
# $classDist was defined earlier with string keys
foreach ($l in $allLabels) { $classDist[[string]$l]++ }
$metadata = [pscustomobject]@{
    dataset_version = '1.0'
    random_seed = $seed
    total_examples = $allLabels.Count
    training_examples = $trainRows.Count
    validation_examples = $valRows.Count
    test_examples = $testRows.Count
    unique_student_count = $TOTAL_STUDENTS
    opportunity_count = $opportunities.Count
    feature_names = $trainRows[0].PSObject.Properties.Name
    target_label = 'label'
    label_meanings = @{ '0'='Poor Match'; '1'='Weak Match'; '2'='Moderate Match'; '3'='Good Match'; '4'='Excellent Match' }
    class_distribution = $classDist
    split_method = 'Student-level split (train/validation/test)'
    generation_method = 'Synthetic based on opportunity pool with expert rule labeling.'
    synthetic_data = $true
    notes = @('Student profiles are generated independently with realistic variation.', 'Labels are derived from expert rules.')
}
$metadata | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $dataDir 'dataset_metadata.json') -Encoding UTF8

# ----- Report -----
$report = "# Dataset Report`n`n**Total examples:** $($metadata.total_examples)`n`n**Training:** $($metadata.training_examples)`n**Validation:** $($metadata.validation_examples)`n**Test:** $($metadata.test_examples)`n`n## Class distribution`n"
foreach ($k in 0..4) {
    $cnt = $classDist[$k]
    $pct = [math]::Round(($cnt / $metadata.total_examples) * 100, 2)
    $report += ("- Label {0}: {1} ({2}%)`n" -f $k, $cnt, $pct)
}
$report += "`nGenerated on: $(Get-Date -Format o)`n"
$report | Set-Content -Path (Join-Path $dataDir 'DATASET_REPORT.md') -Encoding UTF8

Write-Host 'Dataset generation complete.'
