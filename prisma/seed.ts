import 'dotenv/config';
import { PrismaClient, Difficulty } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Types ────────────────────────────────────────────────────────────────────
interface PreliminaryQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
interface InterviewQuestion {
  question: string;
  level: 'easy' | 'medium' | 'hard';
}
interface QuestionSeed {
  number: number;
  name: string;
  topics: string[];
  leetcodeUrl: string;
  difficulty: Difficulty;
  orderInModule: number;
  hintContent: string;
  interviewQuestions: InterviewQuestion[];
}
interface ModuleSeed {
  slug: string;
  name: string;
  description: string;
  order: number;
  iconKey: string;
  introContent: string;
  preliminaryQuestions: PreliminaryQuestion[];
  questions: QuestionSeed[];
}

// ─── Module Data ─────────────────────────────────────────────────────────────
const modules: ModuleSeed[] = [
// ═══════════════════════════════════════════════════════════
// MODULE 1 — Arrays & Basics
// ═══════════════════════════════════════════════════════════
{
  slug: 'arrays-basics', name: 'Arrays & Basics', order: 1, iconKey: 'array',
  description: 'Master the foundation of all data structures: arrays, hash maps, and basic iteration patterns.',
  introContent: `# Arrays & Basics\n\n## What is an Array?\nAn **array** is an ordered collection of elements stored in contiguous memory. Each element is accessed by its **index** (0-based).\n\n## Why Arrays?\n- O(1) random access by index\n- Cache-friendly due to contiguous memory\n- Foundation for almost every other data structure\n\n## Key Concepts\n### Hash Maps (Dictionaries)\nA hash map stores **key-value pairs** for O(1) average lookup, insert, and delete.\n\`\`\`python\ncount = {}\nfor num in nums:\n    count[num] = count.get(num, 0) + 1\n\`\`\`\n\n### Prefix Sums\nPrecompute cumulative sums to answer range queries in O(1):\n\`\`\`python\nprefix = [0] * (n + 1)\nfor i in range(n):\n    prefix[i+1] = prefix[i] + nums[i]\n\`\`\`\n\n### Kadane's Algorithm\nFind maximum subarray sum in O(n) by tracking current and global max:\n\`\`\`python\ncur = best = nums[0]\nfor x in nums[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\n\`\`\`\n\n## Time & Space Complexities\n| Operation | Array | Hash Map |\n|-----------|-------|----------|\n| Access    | O(1)  | O(1) avg |\n| Search    | O(n)  | O(1) avg |\n| Insert    | O(n)  | O(1) avg |\n| Delete    | O(n)  | O(1) avg |\n`,
  preliminaryQuestions: [
    { question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2, explanation: 'Arrays store elements in contiguous memory, so index-based access is O(1) — constant time.' },
    { question: 'Which data structure offers O(1) average-time lookup by key?', options: ['Array', 'Linked List', 'Hash Map', 'Binary Tree'], answer: 2, explanation: 'A hash map uses a hash function to compute the storage index, giving O(1) average lookup.' },
    { question: 'What does a prefix sum array enable?', options: ['Sorting in O(n)', 'Range sum queries in O(1)', 'Binary search in O(log n)', 'Graph traversal'], answer: 1, explanation: 'Precomputing prefix sums lets you answer "sum from index i to j" in O(1) using prefix[j+1] - prefix[i].' },
    { question: "Kadane's Algorithm solves which problem?", options: ['Find the median', 'Maximum subarray sum', 'Longest increasing subsequence', 'Two sum'], answer: 1, explanation: "Kadane's algorithm finds the contiguous subarray with the maximum sum in O(n) time." },
    { question: 'What is the space complexity of storing n elements in a hash map?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, explanation: 'A hash map with n entries requires O(n) space to store the keys and values.' },
  ],
  questions: [
    {
      number: 1, name: 'Two Sum', orderInModule: 1, difficulty: 'EASY',
      topics: ['Arrays', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
      hintContent: `## Hint: Two Sum\n\n**Key Insight:** Instead of checking every pair (O(n²)), use a hash map to store numbers you've already seen.\n\n**Approach skeleton:**\n\`\`\`python\nseen = {}  # value -> index\nfor i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n        return [seen[complement], i]\n    seen[num] = i\n\`\`\`\n\nThis reduces time to **O(n)**. For each element, check if its complement is already in the map.\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of your Two Sum solution using a hash map?', level: 'easy' },
        { question: 'Why is a hash map more efficient than a nested loop for Two Sum?', level: 'easy' },
        { question: 'Can Two Sum have multiple valid answers? How would you handle that?', level: 'medium' },
        { question: 'What are the space complexity trade-offs of the hash map approach vs. sorting?', level: 'medium' },
        { question: 'How would you modify Two Sum to find all pairs that sum to target?', level: 'hard' },
      ],
    },
    {
      number: 2, name: 'Best Time to Buy and Sell Stock', orderInModule: 2, difficulty: 'EASY',
      topics: ['Arrays', 'Dynamic Programming', 'Greedy'],
      leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
      hintContent: `## Hint: Best Time to Buy and Sell Stock\n\n**Key Insight:** Track the minimum price seen so far as you scan left to right.\n\n**Approach skeleton:**\n\`\`\`python\nmin_price = float('inf')\nmax_profit = 0\nfor price in prices:\n    min_price = min(min_price, price)\n    max_profit = max(max_profit, price - min_price)\n\`\`\`\n\nOne pass, O(n) time, O(1) space.\n`,
      interviewQuestions: [
        { question: 'Explain why we only need one pass through the array.', level: 'easy' },
        { question: 'What happens if prices are in strictly decreasing order?', level: 'easy' },
        { question: 'How would you extend this to allow at most 2 transactions?', level: 'medium' },
        { question: 'What is the time and space complexity of your solution?', level: 'easy' },
        { question: 'How would you solve the version where you can buy and sell on the same day multiple times?', level: 'hard' },
      ],
    },
    {
      number: 3, name: 'Contains Duplicate', orderInModule: 3, difficulty: 'EASY',
      topics: ['Arrays', 'Hash Table', 'Sorting'],
      leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
      hintContent: `## Hint: Contains Duplicate\n\n**Key Insight:** Use a set — if any number is already in the set when you try to add it, a duplicate exists.\n\n\`\`\`python\nseen = set()\nfor num in nums:\n    if num in seen:\n        return True\n    seen.add(num)\nreturn False\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of using a set to detect duplicates?', level: 'easy' },
        { question: 'Compare the set approach versus sorting the array first. What are the trade-offs?', level: 'medium' },
        { question: 'How would you find the actual duplicate element, not just detect if one exists?', level: 'medium' },
        { question: 'What if you had memory constraints and could only use O(1) extra space?', level: 'hard' },
        { question: 'How would you handle finding duplicates within k positions of each other?', level: 'hard' },
      ],
    },
    {
      number: 4, name: 'Product of Array Except Self', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Prefix Sum'],
      leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
      hintContent: `## Hint: Product of Array Except Self\n\n**Key Insight:** For each position, the answer is (product of all elements to the left) × (product of all elements to the right).\n\n**Two-pass approach:**\n\`\`\`python\nn = len(nums)\nresult = [1] * n\n# Left pass: result[i] = product of nums[0..i-1]\nfor i in range(1, n):\n    result[i] = result[i-1] * nums[i-1]\n# Right pass: multiply in suffix products\nright = 1\nfor i in range(n-1, -1, -1):\n    result[i] *= right\n    right *= nums[i]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why can\'t we simply divide the total product by each element?', level: 'easy' },
        { question: 'Explain the left-pass / right-pass strategy and why it works.', level: 'medium' },
        { question: 'What is the time and space complexity of your O(1) extra space solution?', level: 'medium' },
        { question: 'How would you handle the case where the array contains zeros?', level: 'medium' },
        { question: 'How would you modify this for a circular array?', level: 'hard' },
      ],
    },
    {
      number: 5, name: 'Maximum Subarray', orderInModule: 5, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Dynamic Programming', 'Divide & Conquer'],
      leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
      hintContent: `## Hint: Maximum Subarray (Kadane's Algorithm)\n\n**Key Insight:** At each position, decide: start a new subarray here, or extend the current one?\n\n\`\`\`python\ncurrent = best = nums[0]\nfor num in nums[1:]:\n    current = max(num, current + num)  # extend or restart\n    best = max(best, current)\nreturn best\n\`\`\`\n\nIf adding the current number is worse than starting fresh, restart.\n`,
      interviewQuestions: [
        { question: "Explain Kadane's algorithm in your own words.", level: 'easy' },
        { question: 'What is the time and space complexity of the dynamic programming solution?', level: 'easy' },
        { question: 'How would you also return the start and end indices of the maximum subarray?', level: 'medium' },
        { question: 'How does the divide-and-conquer approach work for this problem?', level: 'hard' },
        { question: 'How would you handle the case where all numbers are negative?', level: 'medium' },
      ],
    },
    {
      number: 6, name: 'Move Zeroes', orderInModule: 6, difficulty: 'EASY',
      topics: ['Arrays', 'Two Pointers'],
      leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/',
      hintContent: `## Hint: Move Zeroes\n\n**Key Insight:** Use a slow pointer that only advances when placing a non-zero element.\n\n\`\`\`python\ninsert = 0\nfor num in nums:\n    if num != 0:\n        nums[insert] = num\n        insert += 1\n# Fill remaining positions with zeros\nwhile insert < len(nums):\n    nums[insert] = 0\n    insert += 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'How does the two-pointer approach maintain relative order of non-zero elements?', level: 'easy' },
        { question: 'What is the time and space complexity of the in-place approach?', level: 'easy' },
        { question: 'How would you solve this if you needed to move zeroes to the front instead?', level: 'medium' },
        { question: 'Can you do this with fewer writes to the array?', level: 'medium' },
        { question: 'How would this change for a linked list instead of an array?', level: 'hard' },
      ],
    },
  ],
},
// ═══════════════════════════════════════════════════════════
// MODULE 2 — Two Pointers
// ═══════════════════════════════════════════════════════════
{
  slug: 'two-pointers', name: 'Two Pointers', order: 2, iconKey: 'pointer',
  description: 'Use two indices moving toward each other or in tandem to solve array and string problems efficiently.',
  introContent: `# Two Pointers\n\n## What is the Two Pointers Technique?\nTwo pointers is a pattern where you maintain **two indices** into an array or string, often moving them toward each other from opposite ends, or moving them at different speeds.\n\n## When to Use It\n- Array is **sorted** and you need pairs/triplets\n- Need to detect a cycle (fast/slow pointers)\n- Partitioning or rearranging in-place\n\n## Classic Patterns\n### Opposite Ends\n\`\`\`python\nleft, right = 0, len(arr) - 1\nwhile left < right:\n    if condition(arr[left], arr[right]):\n        process()\n    elif arr[left] + arr[right] < target:\n        left += 1\n    else:\n        right -= 1\n\`\`\`\n\n### Fast & Slow\n\`\`\`python\nslow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n# slow is now at the middle\n\`\`\`\n\n## Key Benefit\nReduces O(n²) brute-force to **O(n)** in many problems.\n`,
  preliminaryQuestions: [
    { question: 'When is the two-pointer technique most applicable?', options: ['When the array is unsorted', 'When you need O(1) lookups', 'When the array is sorted and you seek pairs/triplets', 'When traversing a tree'], answer: 2, explanation: 'Two pointers excel on sorted arrays, allowing you to move pointers based on whether the current sum/product is too high or too low.' },
    { question: 'What is the time complexity of finding all pairs that sum to a target in a sorted array using two pointers?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], answer: 2, explanation: 'Each pointer moves at most n steps total, so the overall complexity is O(n).' },
    { question: 'In the fast/slow pointer pattern, where does the slow pointer end up when the fast pointer reaches the end?', options: ['At the start', 'At the middle', 'At the end', 'At a random position'], answer: 1, explanation: 'Since fast moves twice as fast as slow, when fast reaches the end, slow is at the middle.' },
    { question: 'Which problem is NOT naturally solved with two pointers?', options: ['Detecting a cycle in a linked list', 'Finding a pair that sums to target in sorted array', 'Binary search', 'Trapping rain water'], answer: 2, explanation: 'Binary search uses a single shrinking window with a midpoint calculation, not two pointers moving based on conditions.' },
    { question: 'What must typically be done before applying the opposite-ends two-pointer pattern?', options: ['Reverse the array', 'Sort the array', 'Build a hash map', 'Compute prefix sums'], answer: 1, explanation: 'The opposite-ends pattern relies on sorted order to determine which pointer to advance based on the comparison result.' },
  ],
  questions: [
    {
      number: 7, name: 'Container With Most Water', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Two Pointers', 'Greedy'],
      leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/',
      hintContent: `## Hint: Container With Most Water\n\n**Key Insight:** Start with pointers at both ends. The area is limited by the shorter line, so always move the pointer at the shorter line inward.\n\n\`\`\`python\nleft, right = 0, len(height) - 1\nmax_water = 0\nwhile left < right:\n    water = min(height[left], height[right]) * (right - left)\n    max_water = max(max_water, water)\n    if height[left] < height[right]:\n        left += 1\n    else:\n        right -= 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we always move the pointer at the shorter line, not the taller one?', level: 'easy' },
        { question: 'What is the time complexity and why is it O(n)?', level: 'easy' },
        { question: 'Could there be a case where we should move the taller pointer? Explain.', level: 'medium' },
        { question: 'How would you prove this greedy approach is optimal (i.e., won\'t miss the answer)?', level: 'hard' },
        { question: 'How would you extend this to a 3D problem (largest volume box)?', level: 'hard' },
      ],
    },
    {
      number: 8, name: '3Sum', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Two Pointers', 'Sorting'],
      leetcodeUrl: 'https://leetcode.com/problems/3sum/',
      hintContent: `## Hint: 3Sum\n\n**Key Insight:** Sort the array first, then for each element, run a two-pointer search for the complementary pair.\n\n\`\`\`python\nnums.sort()\nresult = []\nfor i in range(len(nums) - 2):\n    if i > 0 and nums[i] == nums[i-1]:\n        continue  # skip duplicates\n    left, right = i + 1, len(nums) - 1\n    while left < right:\n        s = nums[i] + nums[left] + nums[right]\n        if s == 0: \n            result.append([nums[i], nums[left], nums[right]])\n            # skip duplicates for left and right\n        elif s < 0: left += 1\n        else: right -= 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we sort the array before applying two pointers?', level: 'easy' },
        { question: 'How do you handle duplicate triplets in your solution?', level: 'medium' },
        { question: 'What is the overall time complexity of the sort + two-pointer approach?', level: 'easy' },
        { question: 'How would you extend this to 4Sum?', level: 'medium' },
        { question: 'What is the minimum number of comparisons needed to solve 3Sum?', level: 'hard' },
      ],
    },
    {
      number: 9, name: 'Remove Duplicates from Sorted Array', orderInModule: 3, difficulty: 'EASY',
      topics: ['Arrays', 'Two Pointers'],
      leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
      hintContent: `## Hint: Remove Duplicates from Sorted Array\n\n**Key Insight:** Use a slow pointer that marks the position for the next unique element.\n\n\`\`\`python\nif not nums: return 0\nk = 1  # first element is always unique\nfor i in range(1, len(nums)):\n    if nums[i] != nums[i-1]:\n        nums[k] = nums[i]\n        k += 1\nreturn k\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why can we do this in-place without extra space?', level: 'easy' },
        { question: 'What property of the sorted array makes this possible?', level: 'easy' },
        { question: 'How would you modify this to allow at most 2 duplicates?', level: 'medium' },
        { question: 'What changes if the array is unsorted?', level: 'medium' },
        { question: 'How would this work for removing duplicates from a sorted linked list?', level: 'medium' },
      ],
    },
    {
      number: 10, name: 'Valid Palindrome', orderInModule: 4, difficulty: 'EASY',
      topics: ['Strings', 'Two Pointers'],
      leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
      hintContent: `## Hint: Valid Palindrome\n\n**Key Insight:** Use two pointers from both ends, skipping non-alphanumeric characters, comparing case-insensitively.\n\n\`\`\`python\nleft, right = 0, len(s) - 1\nwhile left < right:\n    while left < right and not s[left].isalnum(): left += 1\n    while left < right and not s[right].isalnum(): right -= 1\n    if s[left].lower() != s[right].lower(): return False\n    left += 1; right -= 1\nreturn True\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'How do you handle special characters and case sensitivity?', level: 'easy' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you check if a string is a palindrome after deleting at most one character?', level: 'medium' },
        { question: 'How would you find the longest palindromic subsequence?', level: 'hard' },
        { question: 'How would you solve this with recursion instead of iteration?', level: 'medium' },
      ],
    },
    {
      number: 11, name: 'Trapping Rain Water', orderInModule: 5, difficulty: 'HARD',
      topics: ['Arrays', 'Two Pointers', 'Stack', 'Dynamic Programming'],
      leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      hintContent: `## Hint: Trapping Rain Water\n\n**Key Insight:** For each position, water trapped = min(max_left, max_right) - height[i]. Use two pointers to compute this in O(n) without precomputing arrays.\n\n\`\`\`python\nleft, right = 0, len(height) - 1\nleft_max = right_max = 0\nwater = 0\nwhile left < right:\n    if height[left] < height[right]:\n        if height[left] >= left_max: left_max = height[left]\n        else: water += left_max - height[left]\n        left += 1\n    else:\n        if height[right] >= right_max: right_max = height[right]\n        else: water += right_max - height[right]\n        right -= 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain why water at any position is determined by the minimum of max_left and max_right.', level: 'easy' },
        { question: 'Compare the DP precomputation approach vs. the two-pointer approach.', level: 'medium' },
        { question: 'What is the time and space complexity of the two-pointer solution?', level: 'easy' },
        { question: 'How would you solve this using a monotonic stack?', level: 'hard' },
        { question: 'How would you extend this to a 2D grid (volume of trapped water)?', level: 'hard' },
      ],
    },
  ],
},
// ═══════════════════════════════════════════════════════════
// MODULE 3 — Sliding Window
// ═══════════════════════════════════════════════════════════
{
  slug: 'sliding-window', name: 'Sliding Window', order: 3, iconKey: 'window',
  description: 'Efficiently process contiguous subarrays or substrings by maintaining a dynamic window.',
  introContent: `# Sliding Window\n\n## What is Sliding Window?\nA sliding window maintains a **contiguous range** [left, right] within an array or string, expanding and contracting it as you iterate.\n\n## Fixed vs. Variable Size\n- **Fixed window:** window size k stays constant — slide right, drop leftmost element\n- **Variable window:** expand right until constraint violated, then shrink left\n\n## Variable Window Template\n\`\`\`python\nleft = 0\nwindow = {}  # or counter, sum, etc.\nfor right in range(len(s)):\n    # Add s[right] to window\n    window[s[right]] = window.get(s[right], 0) + 1\n    # Shrink if constraint violated\n    while invalid(window):\n        window[s[left]] -= 1\n        left += 1\n    # Update answer\n    answer = max(answer, right - left + 1)\n\`\`\`\n\n## Common Use Cases\n- Longest substring without repeating characters\n- Minimum window containing all required characters\n- Maximum sum subarray of fixed size k\n`,
  preliminaryQuestions: [
    { question: 'What is the main advantage of the sliding window technique over brute force?', options: ['It reduces space to O(1)', 'It avoids redundant recomputation by reusing the previous window', 'It sorts the array first', 'It uses recursion'], answer: 1, explanation: 'The sliding window avoids recomputing the whole window from scratch by incrementally adding the new right element and removing the old left element.' },
    { question: 'When should you use a fixed-size sliding window vs. a variable-size one?', options: ['Fixed when you want the minimum; variable for maximum', 'Fixed when the window size k is given; variable when the window depends on a constraint', 'Fixed for strings; variable for arrays', 'They are interchangeable'], answer: 1, explanation: 'Fixed-size windows are used when k is explicit in the problem. Variable-size windows grow and shrink based on whether a constraint (e.g., at most k distinct chars) is satisfied.' },
    { question: 'What data structure is most often used to track the contents of a sliding window over a string?', options: ['Stack', 'Queue', 'Hash Map / Counter', 'Heap'], answer: 2, explanation: 'A hash map or frequency counter tracks how many times each character appears in the current window, enabling O(1) updates.' },
    { question: 'In a variable sliding window, what triggers the left pointer to move right?', options: ['The window sum becomes negative', 'The window violates the problem constraint', 'The right pointer reaches the end', 'The window size exceeds n/2'], answer: 1, explanation: "Whenever the window's constraint is violated (e.g., more than k distinct chars), we shrink from the left until it's valid again." },
    { question: 'What is the time complexity of the sliding window approach for most string problems?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n·k)'], answer: 2, explanation: 'Each element enters and exits the window at most once, giving O(n) total time.' },
  ],
  questions: [
    {
      number: 12, name: 'Longest Substring Without Repeating Characters', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Strings', 'Sliding Window', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      hintContent: `## Hint: Longest Substring Without Repeating Characters\n\n**Key Insight:** Use a sliding window with a set or map. Expand right, and when a duplicate is found, shrink from the left until no duplicates remain.\n\n\`\`\`python\nchar_index = {}  # char -> last seen index\nleft = max_len = 0\nfor right, ch in enumerate(s):\n    if ch in char_index and char_index[ch] >= left:\n        left = char_index[ch] + 1\n    char_index[ch] = right\n    max_len = max(max_len, right - left + 1)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'How does using a map of last-seen indices help avoid redundant shrinking?', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you modify this to find the longest substring with at most k distinct characters?', level: 'medium' },
        { question: 'What edge cases should you handle (empty string, all same characters)?', level: 'easy' },
        { question: 'How does your solution change if the input is Unicode (multi-byte characters)?', level: 'hard' },
      ],
    },
    {
      number: 13, name: 'Minimum Window Substring', orderInModule: 2, difficulty: 'HARD',
      topics: ['Strings', 'Sliding Window', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/',
      hintContent: `## Hint: Minimum Window Substring\n\n**Key Insight:** Maintain a count of required characters and a "have" counter. Expand right until you have all required chars, then shrink left to minimize.\n\n\`\`\`python\nfrom collections import Counter\nneed = Counter(t)\nhave, total = 0, len(need)\nwindow = {}\nleft = 0; result = (float('inf'), 0, 0)\nfor right, ch in enumerate(s):\n    window[ch] = window.get(ch, 0) + 1\n    if ch in need and window[ch] == need[ch]:\n        have += 1\n    while have == total:\n        if right - left + 1 < result[0]:\n            result = (right - left + 1, left, right)\n        window[s[left]] -= 1\n        if s[left] in need and window[s[left]] < need[s[left]]:\n            have -= 1\n        left += 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain the "have" and "total" counters and their role.', level: 'medium' },
        { question: 'What is the time complexity and why?', level: 'easy' },
        { question: 'How do you handle duplicate characters in t?', level: 'medium' },
        { question: 'What changes if we need the minimum window that is a permutation of t?', level: 'hard' },
        { question: 'How would you find all windows that contain all characters of t?', level: 'hard' },
      ],
    },
    {
      number: 14, name: 'Permutation in String', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Strings', 'Sliding Window', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/',
      hintContent: `## Hint: Permutation in String\n\n**Key Insight:** Use a fixed-size window of length len(s1). Maintain a frequency count and check if it matches s1's frequency count.\n\n\`\`\`python\nfrom collections import Counter\ncount1 = Counter(s1)\nwindow = Counter(s2[:len(s1)])\nif window == count1: return True\nfor i in range(len(s1), len(s2)):\n    window[s2[i]] += 1\n    left_ch = s2[i - len(s1)]\n    window[left_ch] -= 1\n    if window[left_ch] == 0: del window[left_ch]\n    if window == count1: return True\nreturn False\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is a fixed-size window appropriate here?', level: 'easy' },
        { question: 'How do you efficiently check if two character counts are equal?', level: 'medium' },
        { question: 'What is the time complexity? Can you optimize the comparison?', level: 'medium' },
        { question: 'How would you find all starting indices where a permutation of s1 begins in s2?', level: 'medium' },
        { question: 'How would you solve this for a 2D matrix (find if a permutation of s1 appears as a row)?', level: 'hard' },
      ],
    },
    {
      number: 15, name: 'Sliding Window Maximum', orderInModule: 4, difficulty: 'HARD',
      topics: ['Arrays', 'Sliding Window', 'Queue', 'Monotonic Queue'],
      leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/',
      hintContent: `## Hint: Sliding Window Maximum\n\n**Key Insight:** Use a monotonic deque that stores indices in decreasing order of their values. The front of the deque is always the index of the maximum for the current window.\n\n\`\`\`python\nfrom collections import deque\ndq = deque()  # stores indices, decreasing by value\nresult = []\nfor i, num in enumerate(nums):\n    # Remove indices outside window\n    while dq and dq[0] < i - k + 1: dq.popleft()\n    # Remove smaller elements from back\n    while dq and nums[dq[-1]] < num: dq.pop()\n    dq.append(i)\n    if i >= k - 1: result.append(nums[dq[0]])\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is a monotonic deque and why is it useful here?', level: 'medium' },
        { question: 'Why do we remove elements from the back of the deque when a larger element arrives?', level: 'medium' },
        { question: 'What is the amortized time complexity?', level: 'medium' },
        { question: 'How would you solve Sliding Window Minimum instead?', level: 'easy' },
        { question: 'How would this change for a 2D sliding window maximum?', level: 'hard' },
      ],
    },
  ],
},
// ═══════════════════════════════════════════════════════════
// MODULE 4 — Strings
// ═══════════════════════════════════════════════════════════
{
  slug: 'strings', name: 'Strings', order: 4, iconKey: 'string',
  description: 'Manipulate, search, and transform strings using hash maps, two pointers, and dynamic programming.',
  introContent: `# Strings\n\n## String Fundamentals\nStrings are sequences of characters. In most languages they are **immutable** — operations return new strings.\n\n## Key Techniques\n\n### Anagram Detection (Hash Map)\nTwo strings are anagrams if they have the same character frequencies:\n\`\`\`python\nfrom collections import Counter\nCounter(s) == Counter(t)  # O(n)\n\`\`\`\n\n### Expand Around Center (Palindromes)\nFor each character (and gap between characters), expand outward while characters match:\n\`\`\`python\ndef expand(s, l, r):\n    while l >= 0 and r < len(s) and s[l] == s[r]:\n        l -= 1; r += 1\n    return s[l+1:r]\n\`\`\`\n\n### String Parsing\nWhen implementing atoi:\n1. Skip whitespace\n2. Handle optional sign\n3. Read digits, stop at non-digit\n4. Clamp to 32-bit integer range\n\n## Complexity Note\nString concatenation in a loop is O(n²) in many languages — use a list and join at the end.\n`,
  preliminaryQuestions: [
    { question: 'What does it mean for two strings to be anagrams?', options: ['They have the same length', 'One is a substring of the other', 'They contain the same characters with the same frequencies', 'They are reverses of each other'], answer: 2, explanation: 'Anagrams are strings that use the exact same characters with the same frequencies, just in a different order.' },
    { question: 'What is the most efficient way to check if two strings are anagrams?', options: ['Sort both and compare — O(n log n)', 'Count character frequencies with a hash map — O(n)', 'Check all permutations — O(n!)', 'Use brute force comparison — O(n²)'], answer: 1, explanation: 'Counting frequencies with a hash map (or array of 26) runs in O(n) time and O(1) space for lowercase English letters.' },
    { question: 'Why is expanding around center a good approach for finding palindromes?', options: ['It avoids using extra space', 'It finds all palindromes in O(n) time', 'Every palindrome has a center that can be expanded from', 'It only works for odd-length palindromes'], answer: 2, explanation: 'Every palindrome is symmetric around its center. By trying each possible center (n for odd, n-1 for even), we find all palindromic substrings.' },
    { question: 'What are the edge cases to handle in implementing atoi (string to integer)?', options: ['Only leading zeros', 'Whitespace, sign, non-digit characters, and integer overflow', 'Only negative numbers', 'Only scientific notation'], answer: 1, explanation: 'A robust atoi must handle leading whitespace, an optional +/- sign, non-digit terminators, and clamping the result to the 32-bit signed integer range.' },
    { question: 'Why is string concatenation in a loop inefficient in many languages?', options: ['Strings are mutable', 'Each concatenation copies the entire string, giving O(n²) total', 'It requires sorting', 'Loops are slower than recursion'], answer: 1, explanation: 'Because strings are immutable, each += creates a new string copying all previous content, leading to O(1 + 2 + ... + n) = O(n²) work.' },
  ],
  questions: [
    {
      number: 16, name: 'Valid Anagram', orderInModule: 1, difficulty: 'EASY',
      topics: ['Strings', 'Hash Table', 'Sorting'],
      leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
      hintContent: `## Hint: Valid Anagram\n\n**Key Insight:** Count character frequencies. If counts are equal, they are anagrams.\n\n\`\`\`python\nfrom collections import Counter\nreturn Counter(s) == Counter(t)\n# Or manually:\nif len(s) != len(t): return False\ncount = [0] * 26\nfor c in s: count[ord(c) - ord('a')] += 1\nfor c in t: count[ord(c) - ord('a')] -= 1\nreturn all(x == 0 for x in count)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of using a hash map vs. sorting for this problem?', level: 'easy' },
        { question: 'How would you handle Unicode characters instead of just lowercase ASCII?', level: 'medium' },
        { question: 'How would you group a list of strings into anagram groups?', level: 'medium' },
        { question: 'Can two strings of different lengths be anagrams?', level: 'easy' },
        { question: 'How would you check if one string is an anagram of any substring of another?', level: 'hard' },
      ],
    },
    {
      number: 17, name: 'Group Anagrams', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Strings', 'Hash Table', 'Sorting'],
      leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
      hintContent: `## Hint: Group Anagrams\n\n**Key Insight:** Use a sorted version of each word (or its character frequency tuple) as the hash map key.\n\n\`\`\`python\nfrom collections import defaultdict\ngroups = defaultdict(list)\nfor word in strs:\n    key = tuple(sorted(word))  # or tuple(count array)\n    groups[key].append(word)\nreturn list(groups.values())\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why does sorted(word) serve as a valid anagram key?', level: 'easy' },
        { question: 'Can you use a frequency count tuple instead of sorting? What are the trade-offs?', level: 'medium' },
        { question: 'What is the time complexity of the sorting approach?', level: 'easy' },
        { question: 'How would you stream group anagrams from a continuous input?', level: 'hard' },
        { question: 'How would you find the group with the most anagrams?', level: 'medium' },
      ],
    },
    {
      number: 18, name: 'Longest Palindromic Substring', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Strings', 'Dynamic Programming'],
      leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
      hintContent: `## Hint: Longest Palindromic Substring\n\n**Key Insight:** For each character (and gap), expand outward while characters match. Track the longest expansion.\n\n\`\`\`python\ndef expand(l, r):\n    while l >= 0 and r < len(s) and s[l] == s[r]:\n        l -= 1; r += 1\n    return s[l+1:r]\n\nresult = ""\nfor i in range(len(s)):\n    odd  = expand(i, i)    # odd-length palindromes\n    even = expand(i, i+1)  # even-length palindromes\n    result = max(result, odd, even, key=len)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we check both odd and even length palindromes?', level: 'easy' },
        { question: 'What is the time complexity of expand-around-center?', level: 'easy' },
        { question: 'Explain the DP approach for this problem. What is its space complexity?', level: 'medium' },
        { question: 'What is Manacher\'s algorithm and when would you use it?', level: 'hard' },
        { question: 'How would you count all palindromic substrings (not just the longest)?', level: 'medium' },
      ],
    },
    {
      number: 19, name: 'String to Integer (atoi)', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Strings', 'Math'],
      leetcodeUrl: 'https://leetcode.com/problems/string-to-integer-atoi/',
      hintContent: `## Hint: String to Integer (atoi)\n\n**Steps:** 1) Skip leading whitespace 2) Read optional sign 3) Read digits 4) Clamp to INT range.\n\n\`\`\`python\nINT_MAX, INT_MIN = 2**31 - 1, -(2**31)\ns = s.lstrip()\nif not s: return 0\nsign = -1 if s[0] == '-' else 1\ns = s[1:] if s[0] in '+-' else s\nresult = 0\nfor ch in s:\n    if not ch.isdigit(): break\n    result = result * 10 + int(ch)\nresult *= sign\nreturn max(INT_MIN, min(INT_MAX, result))\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What are all the edge cases you need to handle?', level: 'easy' },
        { question: 'How do you handle overflow before clamping?', level: 'medium' },
        { question: 'How would you use a finite state machine to implement atoi?', level: 'hard' },
        { question: 'How would you implement the reverse — integer to string?', level: 'easy' },
        { question: 'How would you handle scientific notation like "3.14e2"?', level: 'hard' },
      ],
    },
    {
      number: 20, name: 'Implement strStr()', orderInModule: 5, difficulty: 'EASY',
      topics: ['Strings', 'Two Pointers', 'String Matching'],
      leetcodeUrl: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
      hintContent: `## Hint: Implement strStr()\n\n**Key Insight:** Slide a window of size len(needle) over haystack, checking for a match at each position.\n\n\`\`\`python\nif not needle: return 0\nn, m = len(haystack), len(needle)\nfor i in range(n - m + 1):\n    if haystack[i:i+m] == needle:\n        return i\nreturn -1\n# For O(n) solution, look into KMP algorithm\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of the brute-force sliding window approach?', level: 'easy' },
        { question: 'Explain how KMP (Knuth-Morris-Pratt) improves upon brute force.', level: 'hard' },
        { question: 'What is the failure function in KMP and what does it represent?', level: 'hard' },
        { question: 'How would you handle multiple pattern searches simultaneously?', level: 'hard' },
        { question: 'What are the edge cases: empty needle, needle longer than haystack?', level: 'easy' },
      ],
    },
  ],
},
// MODULE 5 — Linked List
{
  slug: 'linked-list', name: 'Linked List', order: 5, iconKey: 'list',
  description: 'Navigate, reverse, and restructure singly and doubly linked lists.',
  introContent: `# Linked List\n\n## What is a Linked List?\nA linked list is a chain of **nodes**, each containing a value and a pointer to the next node. Unlike arrays, elements are not stored contiguously.\n\n## Key Operations\n| Operation | Time |\n|-----------|------|\n| Access by index | O(n) |\n| Insert at head | O(1) |\n| Insert at tail | O(n) |\n| Delete (with pointer) | O(1) |\n| Search | O(n) |\n\n## Common Patterns\n\n### Dummy Head Node\nAdding a dummy node before the head simplifies edge cases:\n\`\`\`python\ndummy = ListNode(0)\ndummy.next = head\ncur = dummy\n# ... process ...\nreturn dummy.next\n\`\`\`\n\n### Fast & Slow Pointers\n- Find middle: fast moves 2x, slow moves 1x\n- Detect cycle: if fast meets slow, cycle exists\n- Find kth from end: advance fast by k, then move both\n\n### Reversing a Linked List\n\`\`\`python\nprev, cur = None, head\nwhile cur:\n    nxt = cur.next\n    cur.next = prev\n    prev = cur\n    cur = nxt\nreturn prev\n\`\`\`\n`,
  preliminaryQuestions: [
    { question: 'What is the time complexity of accessing the kth element in a singly linked list?', options: ['O(1)', 'O(log k)', 'O(k)', 'O(n²)'], answer: 2, explanation: 'You must traverse from the head, following next pointers, which takes O(k) steps — proportional to the position.' },
    { question: 'What is a dummy head node used for in linked list problems?', options: ['To make the list circular', 'To simplify edge cases when the head itself may change', 'To store the length of the list', 'To enable O(1) tail access'], answer: 1, explanation: 'A dummy node before the head means you never have to special-case an empty list or head-deletion, keeping the logic uniform.' },
    { question: 'In the fast/slow pointer technique for cycle detection, when do you conclude a cycle exists?', options: ['When slow reaches null', 'When fast reaches null', 'When fast and slow meet at the same node', 'When fast is exactly 2 nodes ahead of slow'], answer: 2, explanation: 'If there is a cycle, fast will eventually lap slow and they will meet at the same node within the cycle.' },
    { question: 'What is the time and space complexity of reversing a linked list iteratively?', options: ['O(n) time, O(n) space', 'O(n) time, O(1) space', 'O(n²) time, O(1) space', 'O(1) time, O(1) space'], answer: 1, explanation: 'We visit each node once (O(n)) and only maintain three pointers (prev, cur, nxt), so space is O(1).' },
    { question: 'To find the kth node from the end of a linked list in one pass, what technique do you use?', options: ['Reverse the list first', 'Use a stack', 'Two pointers: advance the first pointer k steps ahead', 'Binary search'], answer: 2, explanation: 'Advance the lead pointer k steps, then move both pointers together. When lead reaches the end, the follower is at the kth from last.' },
  ],
  questions: [
    {
      number: 21, name: 'Reverse Linked List', orderInModule: 1, difficulty: 'EASY',
      topics: ['Linked List', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
      hintContent: `## Hint: Reverse Linked List\n\n**Iterative:** Use three pointers — prev, cur, next.\n\n\`\`\`python\nprev, cur = None, head\nwhile cur:\n    nxt = cur.next\n    cur.next = prev\n    prev = cur\n    cur = nxt\nreturn prev\n\`\`\`\n\n**Recursive:** Reverse the rest, then fix the last link.\n`,
      interviewQuestions: [
        { question: 'Walk me through the iterative reversal step by step.', level: 'easy' },
        { question: 'How does the recursive solution work? What is its space complexity?', level: 'medium' },
        { question: 'How would you reverse only a portion [m, n] of the list?', level: 'medium' },
        { question: 'How would you reverse nodes in k-groups?', level: 'hard' },
        { question: 'What is the difference between reversing a singly vs. doubly linked list?', level: 'medium' },
      ],
    },
    {
      number: 22, name: 'Merge Two Sorted Lists', orderInModule: 2, difficulty: 'EASY',
      topics: ['Linked List', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
      hintContent: `## Hint: Merge Two Sorted Lists\n\n**Key Insight:** Use a dummy head and always attach the smaller current node.\n\n\`\`\`python\ndummy = ListNode(0)\ncur = dummy\nwhile l1 and l2:\n    if l1.val <= l2.val:\n        cur.next = l1; l1 = l1.next\n    else:\n        cur.next = l2; l2 = l2.next\n    cur = cur.next\ncur.next = l1 or l2\nreturn dummy.next\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is a dummy head node helpful here?', level: 'easy' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you merge k sorted linked lists?', level: 'hard' },
        { question: 'How does the recursive approach compare to the iterative one?', level: 'medium' },
        { question: 'How would you merge two sorted arrays in-place?', level: 'medium' },
      ],
    },
    {
      number: 23, name: 'Linked List Cycle', orderInModule: 3, difficulty: 'EASY',
      topics: ['Linked List', 'Two Pointers', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/',
      hintContent: `## Hint: Linked List Cycle\n\n**Floyd's Algorithm:** Fast pointer moves 2x, slow pointer moves 1x. If they meet, a cycle exists.\n\n\`\`\`python\nslow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        return True\nreturn False\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why does fast + slow meet inside the cycle if one exists?', level: 'medium' },
        { question: 'How would you find the entry point of the cycle (not just detect it)?', level: 'hard' },
        { question: 'What is the time and space complexity of Floyd\'s algorithm vs. using a hash set?', level: 'easy' },
        { question: 'How would you find the length of the cycle?', level: 'medium' },
        { question: 'Can this technique be used for arrays? Give an example.', level: 'hard' },
      ],
    },
    {
      number: 24, name: 'Remove Nth Node From End of List', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Linked List', 'Two Pointers'],
      leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
      hintContent: `## Hint: Remove Nth Node From End\n\n**One-pass strategy:** Use a dummy head. Advance lead pointer n+1 steps, then move both until lead is null. Follower's next is the node to remove.\n\n\`\`\`python\ndummy = ListNode(0, head)\nlead = follow = dummy\nfor _ in range(n + 1):\n    lead = lead.next\nwhile lead:\n    lead = lead.next\n    follow = follow.next\nfollow.next = follow.next.next\nreturn dummy.next\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we advance the lead pointer n+1 steps instead of n?', level: 'medium' },
        { question: 'What role does the dummy head play?', level: 'easy' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you remove all nodes with a specific value?', level: 'medium' },
        { question: 'How would you solve this in two passes?', level: 'easy' },
      ],
    },
    {
      number: 25, name: 'Reorder List', orderInModule: 5, difficulty: 'MEDIUM',
      topics: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/reorder-list/',
      hintContent: `## Hint: Reorder List\n\n**Three steps:** 1) Find mid (fast/slow). 2) Reverse second half. 3) Merge first and reversed second halves alternately.\n\n\`\`\`python\n# Step 1: find mid\nslow, fast = head, head.next\nwhile fast and fast.next:\n    slow, fast = slow.next, fast.next.next\n# Step 2: reverse second half\nsecond = slow.next; slow.next = None\nprev = None\nwhile second:\n    tmp = second.next; second.next = prev\n    prev = second; second = tmp\n# Step 3: merge\nfirst, second = head, prev\n# interleave...\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we reverse the second half before merging?', level: 'medium' },
        { question: 'Walk me through all three steps with a concrete example.', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you solve this using a deque?', level: 'medium' },
        { question: 'How would you verify your in-place reordering is correct?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 6 — Stack & Queue
{
  slug: 'stack-queue', name: 'Stack & Queue', order: 6, iconKey: 'stack',
  description: 'Use LIFO and FIFO data structures to solve bracket matching, monotonic stack, and evaluation problems.',
  introContent: `# Stack & Queue\n\n## Stack (LIFO)\nLast-In, First-Out. Operations: **push**, **pop**, **peek** — all O(1).\n\nUse a stack when:\n- You need to undo the last action\n- Matching brackets or tags\n- Monotonic stack (next greater element)\n\n## Queue (FIFO)\nFirst-In, First-Out. Use **deque** in Python for O(1) on both ends.\n\nUse a queue when:\n- BFS traversal\n- Level-order processing\n- Sliding window maximum (monotonic deque)\n\n## Monotonic Stack Pattern\nFor "next greater element" problems, maintain a stack in decreasing order:\n\`\`\`python\nstack = []\nfor i, num in enumerate(nums):\n    while stack and nums[stack[-1]] < num:\n        idx = stack.pop()\n        result[idx] = num  # num is next greater for idx\n    stack.append(i)\n\`\`\`\n\n## RPN Evaluation\n\`\`\`python\nstack = []\nfor token in tokens:\n    if token in '+-*/':\n        b, a = stack.pop(), stack.pop()\n        stack.append(int(operate(a, b, token)))\n    else:\n        stack.append(int(token))\nreturn stack[0]\n\`\`\`\n`,
  preliminaryQuestions: [
    { question: 'What does LIFO stand for and which data structure implements it?', options: ['Last In First Out — Stack', 'Last In First Out — Queue', 'Least Important First Out — Stack', 'Largest Integer First Out — Heap'], answer: 0, explanation: 'LIFO (Last In First Out) is the defining property of a stack — the most recently pushed item is the first to be popped.' },
    { question: 'What is a monotonic stack used for?', options: ['Sorting elements efficiently', 'Finding next greater or smaller elements in O(n)', 'Implementing a queue using two stacks', 'Balancing binary trees'], answer: 1, explanation: 'A monotonic stack maintains elements in increasing or decreasing order and efficiently answers "next greater/smaller element" queries in O(n).' },
    { question: 'How would you implement a queue using two stacks?', options: ['Push to stack1; to dequeue, reverse into stack2 and pop', 'Push to both stacks simultaneously', 'Sort stack1 after every push', 'Use a linked list as a middle layer'], answer: 0, explanation: 'Enqueue pushes to stack1. Dequeue: if stack2 is empty, transfer all of stack1 to stack2 (reversing order), then pop from stack2. Amortized O(1) per operation.' },
    { question: 'In valid parentheses matching, when should you pop from the stack?', options: ['When you see an opening bracket', 'When you see a closing bracket that matches the top of the stack', 'When the stack is full', 'After processing every character'], answer: 1, explanation: "When encountering a closing bracket, check if it matches the stack's top (the most recent unmatched opening bracket). If yes, pop; otherwise it's invalid." },
    { question: 'What is the time complexity of each operation in a properly implemented stack?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2, explanation: 'Stack push, pop, and peek are all O(1) — they only modify or inspect the top element.' },
  ],
  questions: [
    {
      number: 26, name: 'Valid Parentheses', orderInModule: 1, difficulty: 'EASY',
      topics: ['Stack', 'Strings'],
      leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
      hintContent: `## Hint: Valid Parentheses\n\n**Key Insight:** Push opening brackets onto a stack. When you see a closing bracket, check if the top of the stack is its matching opener.\n\n\`\`\`python\nstack = []\npairs = {')': '(', ']': '[', '}': '{'}\nfor ch in s:\n    if ch in '([{':\n        stack.append(ch)\n    elif not stack or stack[-1] != pairs[ch]:\n        return False\n    else:\n        stack.pop()\nreturn not stack\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is a stack the natural data structure for bracket matching?', level: 'easy' },
        { question: 'What are the three failure conditions (besides mismatched brackets)?', level: 'easy' },
        { question: 'How would you find the minimum number of removals to make a string valid?', level: 'hard' },
        { question: 'How would you handle nested tags like HTML elements?', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
      ],
    },
    {
      number: 27, name: 'Min Stack', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Stack', 'Design'],
      leetcodeUrl: 'https://leetcode.com/problems/min-stack/',
      hintContent: `## Hint: Min Stack\n\n**Key Insight:** Maintain a parallel "min stack" that tracks the minimum at each level of the main stack.\n\n\`\`\`python\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n    def push(self, val):\n        self.stack.append(val)\n        min_val = min(val, self.min_stack[-1] if self.min_stack else val)\n        self.min_stack.append(min_val)\n    def pop(self):\n        self.stack.pop(); self.min_stack.pop()\n    def getMin(self):\n        return self.min_stack[-1]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we need a parallel min stack instead of just tracking a single minimum?', level: 'medium' },
        { question: 'What is the time complexity of each operation?', level: 'easy' },
        { question: 'Can you implement Min Stack with O(1) extra space (no parallel stack)?', level: 'hard' },
        { question: 'How would you extend this to also support getMax in O(1)?', level: 'medium' },
        { question: 'How would you implement a Min Queue (FIFO)?', level: 'hard' },
      ],
    },
    {
      number: 28, name: 'Daily Temperatures', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Stack', 'Monotonic Stack'],
      leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/',
      hintContent: `## Hint: Daily Temperatures\n\n**Key Insight:** Use a monotonic decreasing stack of indices. When a warmer day is found, pop and record the wait time.\n\n\`\`\`python\nresult = [0] * len(temperatures)\nstack = []  # indices of days waiting for a warmer day\nfor i, temp in enumerate(temperatures):\n    while stack and temperatures[stack[-1]] < temp:\n        j = stack.pop()\n        result[j] = i - j\n    stack.append(i)\nreturn result\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What property does the stack maintain (what is on it at any point)?', level: 'medium' },
        { question: 'What is the time complexity and why is it O(n) even with the inner while loop?', level: 'medium' },
        { question: 'How would you modify this to find the next greater element to the left?', level: 'medium' },
        { question: 'How would you solve this for a circular array?', level: 'hard' },
        { question: 'What is a monotonic stack and where else is it used?', level: 'easy' },
      ],
    },
    {
      number: 29, name: 'Evaluate Reverse Polish Notation', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Stack', 'Math'],
      leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
      hintContent: `## Hint: Evaluate Reverse Polish Notation\n\n**Key Insight:** Push numbers onto a stack. When you see an operator, pop two numbers, compute the result, and push it back.\n\n\`\`\`python\nstack = []\nfor token in tokens:\n    if token in '+-*/':\n        b, a = stack.pop(), stack.pop()\n        if token == '+': stack.append(a + b)\n        elif token == '-': stack.append(a - b)\n        elif token == '*': stack.append(a * b)\n        else: stack.append(int(a / b))  # truncate toward zero\n    else:\n        stack.append(int(token))\nreturn stack[0]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is RPN (postfix notation) easier to evaluate than infix (standard) notation?', level: 'easy' },
        { question: 'How do you handle the truncation-toward-zero requirement for integer division?', level: 'medium' },
        { question: 'How would you convert infix notation to postfix (Shunting-yard algorithm)?', level: 'hard' },
        { question: 'What is the time and space complexity of evaluation?', level: 'easy' },
        { question: 'How would you handle multi-character numbers and floating-point values?', level: 'medium' },
      ],
    },
  ],
},
// MODULE 7 — Binary Search
{
  slug: 'binary-search', name: 'Binary Search', order: 7, iconKey: 'search',
  description: 'Halve your search space at each step using the binary search pattern on sorted arrays.',
  introContent: `# Binary Search\n\n## Core Idea\nBinary search finds a target in a **sorted** array by repeatedly halving the search space, achieving O(log n) time.\n\n## Template\n\`\`\`python\nleft, right = 0, len(nums) - 1\nwhile left <= right:\n    mid = left + (right - left) // 2  # avoids overflow\n    if nums[mid] == target:\n        return mid\n    elif nums[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1\nreturn -1\n\`\`\`\n\n## Variants\n- **Find first occurrence:** continue left after finding target\n- **Find last occurrence:** continue right after finding target\n- **Rotated sorted array:** determine which half is sorted, then binary search that half\n\n## Key Insight\nBinary search applies to any **monotone predicate** — not just searching a sorted array. "Find the minimum value satisfying condition X" is often solved with binary search on the answer space.\n`,
  preliminaryQuestions: [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], answer: 2, explanation: 'Binary search halves the search space at each step, giving O(log n) iterations.' },
    { question: 'Why do we compute mid as left + (right - left) // 2 instead of (left + right) // 2?', options: ['It is faster', 'It avoids integer overflow when left + right exceeds the maximum integer', 'It gives a different result', 'It is required by Python syntax'], answer: 1, explanation: 'In languages with fixed-size integers (Java, C++), left + right can overflow. The equivalent left + (right - left) // 2 cannot.' },
    { question: 'What condition must the input satisfy for binary search to work correctly?', options: ['The array must be of even length', 'The array must be sorted', 'The array must contain only positive numbers', 'The array must not have duplicates'], answer: 1, explanation: 'Binary search relies on being able to eliminate half the search space based on comparison. This requires the data to be sorted (or at least monotone).' },
    { question: 'How many iterations does binary search take on an array of 1,000,000 elements?', options: ['1,000,000', '500,000', 'About 20', 'About 100'], answer: 2, explanation: 'log₂(1,000,000) ≈ 20. Binary search needs at most ~20 comparisons to search 1 million elements.' },
    { question: 'What is the difference between searching for a target and finding the "first bad version"?', options: ['No difference', 'First bad version uses a monotone predicate: once bad, always bad', 'First bad version requires linear search', 'First bad version uses random access'], answer: 1, explanation: 'First Bad Version applies binary search to a predicate (isBadVersion). The key property is monotonicity: once a version is bad, all subsequent versions are bad.' },
  ],
  questions: [
    {
      number: 30, name: 'Binary Search', orderInModule: 1, difficulty: 'EASY',
      topics: ['Arrays', 'Binary Search'],
      leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
      hintContent: `## Hint: Binary Search\n\n**Standard template:** Keep left <= right, compute mid, eliminate half.\n\n\`\`\`python\nleft, right = 0, len(nums) - 1\nwhile left <= right:\n    mid = left + (right - left) // 2\n    if nums[mid] == target: return mid\n    elif nums[mid] < target: left = mid + 1\n    else: right = mid - 1\nreturn -1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time and space complexity of binary search?', level: 'easy' },
        { question: 'What happens if the array has duplicate elements and you want the first occurrence?', level: 'medium' },
        { question: 'How would you binary search for a floating point value (e.g., sqrt)?', level: 'medium' },
        { question: 'How would you handle an array with all identical elements?', level: 'easy' },
        { question: 'Describe a problem where you binary search on the answer space, not the input.', level: 'hard' },
      ],
    },
    {
      number: 31, name: 'Search in Rotated Sorted Array', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Binary Search'],
      leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      hintContent: `## Hint: Search in Rotated Sorted Array\n\n**Key Insight:** One half of the array is always sorted. Determine which half and binary search there.\n\n\`\`\`python\nleft, right = 0, len(nums) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target: return mid\n    # Left half sorted\n    if nums[left] <= nums[mid]:\n        if nums[left] <= target < nums[mid]: right = mid - 1\n        else: left = mid + 1\n    else:  # Right half sorted\n        if nums[mid] < target <= nums[right]: left = mid + 1\n        else: right = mid - 1\nreturn -1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'How do you determine which half of the rotated array is sorted?', level: 'medium' },
        { question: 'What is the time complexity?', level: 'easy' },
        { question: 'How would you handle duplicates in the rotated array?', level: 'hard' },
        { question: 'How would you find the rotation point (minimum element)?', level: 'medium' },
        { question: 'How would you search in an array that has been rotated multiple times?', level: 'hard' },
      ],
    },
    {
      number: 32, name: 'Find Minimum in Rotated Sorted Array', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Binary Search'],
      leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
      hintContent: `## Hint: Find Minimum in Rotated Sorted Array\n\n**Key Insight:** The minimum is at the inflection point. If mid > right, the minimum is in the right half.\n\n\`\`\`python\nleft, right = 0, len(nums) - 1\nwhile left < right:\n    mid = (left + right) // 2\n    if nums[mid] > nums[right]:\n        left = mid + 1  # min is in right half\n    else:\n        right = mid     # mid could be the min\nreturn nums[left]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we compare nums[mid] with nums[right] (not nums[left])?', level: 'medium' },
        { question: 'What is the termination condition and why left < right (not left <= right)?', level: 'medium' },
        { question: 'How would you handle the case where the array is not rotated at all?', level: 'easy' },
        { question: 'How would you handle duplicates?', level: 'hard' },
        { question: 'How would you find both the minimum and maximum in O(log n)?', level: 'hard' },
      ],
    },
    {
      number: 33, name: 'First Bad Version', orderInModule: 4, difficulty: 'EASY',
      topics: ['Binary Search', 'Interactive'],
      leetcodeUrl: 'https://leetcode.com/problems/first-bad-version/',
      hintContent: `## Hint: First Bad Version\n\n**Key Insight:** Binary search for the first True in a monotone sequence: [F,F,...,F,T,T,...,T].\n\n\`\`\`python\nleft, right = 1, n\nwhile left < right:\n    mid = left + (right - left) // 2\n    if isBadVersion(mid):\n        right = mid   # mid could be first bad\n    else:\n        left = mid + 1\nreturn left\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we use left < right instead of left <= right here?', level: 'medium' },
        { question: 'What is the time complexity in terms of API calls?', level: 'easy' },
        { question: 'How is this pattern (binary search on monotone predicate) generalizable?', level: 'medium' },
        { question: 'How would you minimize API calls to isBadVersion?', level: 'medium' },
        { question: 'Give another problem that reduces to "find first True in a boolean array".', level: 'hard' },
      ],
    },
  ],
},
// MODULE 8 — Trees
{
  slug: 'trees', name: 'Trees', order: 8, iconKey: 'tree',
  description: 'Traverse, search, and validate binary trees and BSTs using DFS and BFS.',
  introContent: `# Trees\n\n## Binary Tree Structure\n\`\`\`python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\`\`\`\n\n## DFS Traversal Orders\n- **Preorder:** Root → Left → Right\n- **Inorder:** Left → Root → Right (gives sorted order for BST)\n- **Postorder:** Left → Right → Root\n\n## BFS (Level Order)\n\`\`\`python\nfrom collections import deque\nqueue = deque([root])\nwhile queue:\n    node = queue.popleft()\n    if node.left: queue.append(node.left)\n    if node.right: queue.append(node.right)\n\`\`\`\n\n## BST Property\nFor every node: all values in left subtree < node.val < all values in right subtree.\n\nInorder traversal of a BST yields a **sorted sequence**.\n\n## Recursive DFS Pattern\n\`\`\`python\ndef solve(node):\n    if not node: return base_case\n    left  = solve(node.left)\n    right = solve(node.right)\n    return combine(node.val, left, right)\n\`\`\`\n`,
  preliminaryQuestions: [
    { question: 'Which traversal of a BST produces elements in sorted order?', options: ['Preorder', 'Inorder', 'Postorder', 'BFS (level order)'], answer: 1, explanation: 'In a BST, every left subtree has smaller values and every right subtree has larger values. Inorder (Left→Root→Right) visits them in ascending order.' },
    { question: 'What data structure does BFS (level order) traversal of a tree use?', options: ['Stack', 'Queue', 'Heap', 'Hash Map'], answer: 1, explanation: 'BFS uses a queue (FIFO). Nodes are visited level by level, and their children are enqueued for the next level.' },
    { question: 'What is the time complexity of searching in a balanced BST?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 1, explanation: 'A balanced BST of n nodes has height O(log n). Each search step eliminates half the remaining nodes.' },
    { question: 'What distinguishes a binary tree from a binary search tree?', options: ['A BST has at most 2 children per node', 'A BST enforces the ordering property: left < node < right', 'A binary tree must be complete', 'A BST must be balanced'], answer: 1, explanation: 'Any tree with at most 2 children is a binary tree. A BST additionally requires that left subtree values < node < right subtree values at every node.' },
    { question: 'What base case do most recursive binary tree functions use?', options: ['node.val == 0', 'node is None', 'node.left is None', 'node.right is None'], answer: 1, explanation: 'Almost all recursive tree algorithms return a base value (like None, 0, True) when the current node is None (a leaf\'s missing child).' },
  ],
  questions: [
    {
      number: 34, name: 'Maximum Depth of Binary Tree', orderInModule: 1, difficulty: 'EASY',
      topics: ['Trees', 'DFS', 'BFS', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
      hintContent: `## Hint: Maximum Depth of Binary Tree\n\n**Recursive:** depth = 1 + max(depth(left), depth(right))\n\n\`\`\`python\ndef maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain the recursive solution — what does the base case represent?', level: 'easy' },
        { question: 'How would you solve this iteratively using BFS?', level: 'medium' },
        { question: 'What is the time and space complexity of the recursive solution?', level: 'easy' },
        { question: 'What is the minimum depth of a binary tree and how does it differ?', level: 'medium' },
        { question: 'How would you find the diameter (longest path) of a binary tree?', level: 'hard' },
      ],
    },
    {
      number: 35, name: 'Same Tree', orderInModule: 2, difficulty: 'EASY',
      topics: ['Trees', 'DFS', 'BFS', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/same-tree/',
      hintContent: `## Hint: Same Tree\n\n**Recursive:** Two trees are the same if their roots have equal values and their left and right subtrees are also the same.\n\n\`\`\`python\ndef isSameTree(p, q):\n    if not p and not q: return True\n    if not p or not q: return False\n    return p.val == q.val and isSameTree(p.left, q.left) and isSameTree(p.right, q.right)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What are the three base cases you must handle?', level: 'easy' },
        { question: 'What is the time complexity in terms of the tree size?', level: 'easy' },
        { question: 'How would you check if one tree is a subtree of another?', level: 'medium' },
        { question: 'How would you serialize a tree to compare trees efficiently?', level: 'hard' },
        { question: 'What changes if you need to check structural equality but not value equality?', level: 'medium' },
      ],
    },
    {
      number: 36, name: 'Invert Binary Tree', orderInModule: 3, difficulty: 'EASY',
      topics: ['Trees', 'DFS', 'BFS', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
      hintContent: `## Hint: Invert Binary Tree\n\n**Recursive:** Swap left and right children at every node.\n\n\`\`\`python\ndef invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain how swapping children at every node produces the mirror image.', level: 'easy' },
        { question: 'How would you implement this iteratively using a queue (BFS)?', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you check if a tree is symmetric without inverting it?', level: 'medium' },
        { question: 'How would you invert only the even levels of a tree?', level: 'hard' },
      ],
    },
    {
      number: 37, name: 'Lowest Common Ancestor of a Binary Tree', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Trees', 'DFS', 'Recursion'],
      leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
      hintContent: `## Hint: Lowest Common Ancestor\n\n**Key Insight:** If either p or q equals root, root is the LCA. Otherwise recurse left and right — if both return non-null, root is the LCA.\n\n\`\`\`python\ndef lca(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left  = lca(root.left, p, q)\n    right = lca(root.right, p, q)\n    if left and right: return root  # p and q in different subtrees\n    return left or right\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain why returning root when it equals p or q is correct.', level: 'medium' },
        { question: 'What does it mean when left AND right are both non-null?', level: 'medium' },
        { question: 'How does LCA in a BST differ from a general binary tree?', level: 'medium' },
        { question: 'How would you handle the case where p or q might not be in the tree?', level: 'hard' },
        { question: 'How would you find LCA for multiple nodes simultaneously?', level: 'hard' },
      ],
    },
    {
      number: 38, name: 'Validate Binary Search Tree', orderInModule: 5, difficulty: 'MEDIUM',
      topics: ['Trees', 'DFS', 'Recursion', 'BST'],
      leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
      hintContent: `## Hint: Validate Binary Search Tree\n\n**Key Insight:** Pass min/max bounds down. Each node must satisfy: min < node.val < max.\n\n\`\`\`python\ndef isValid(node, lo=float('-inf'), hi=float('inf')):\n    if not node: return True\n    if not (lo < node.val < hi): return False\n    return isValid(node.left, lo, node.val) and isValid(node.right, node.val, hi)\nreturn isValid(root)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why can\'t you simply check left.val < node.val < right.val at each node?', level: 'medium' },
        { question: 'Explain how the min/max bounds are updated as you recurse.', level: 'medium' },
        { question: 'How would you validate using inorder traversal?', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you repair a BST where exactly two nodes are swapped?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 9 — Heaps / Priority Queue
{
  slug: 'heaps-priority-queue', name: 'Heaps / Priority Queue', order: 9, iconKey: 'heap',
  description: 'Efficiently find the kth largest/smallest elements using heap data structures.',
  introContent: `# Heaps / Priority Queue\n\n## What is a Heap?\nA heap is a **complete binary tree** where every parent satisfies the heap property:\n- **Min-heap:** parent ≤ children (root is minimum)\n- **Max-heap:** parent ≥ children (root is maximum)\n\n## Python's heapq (Min-Heap)\n\`\`\`python\nimport heapq\nheap = []\nheapq.heappush(heap, 3)\nheapq.heappush(heap, 1)\nheapq.heappush(heap, 2)\nheapq.heappop(heap)  # returns 1 (minimum)\n\`\`\`\n\nFor **max-heap**, negate values: push -x, pop and negate result.\n\n## Key Operations — O(log n)\n- heappush, heappop, heapreplace\n- heapify(list): builds heap in **O(n)**\n\n## Common Patterns\n- **Kth largest:** maintain min-heap of size k\n- **Top K frequent:** use heap after counting frequencies\n- **Merge K sorted lists:** push (value, list_index) into min-heap\n`,
  preliminaryQuestions: [
    { question: 'What is the time complexity of inserting into a heap?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, explanation: 'Insertion adds the element at the end and bubbles it up, taking O(log n) in the worst case.' },
    { question: 'How do you simulate a max-heap using Python\'s min-heap (heapq)?', options: ['Use heapq.max()', 'Negate all values before pushing and after popping', 'Sort the list first', 'Use a reversed list'], answer: 1, explanation: 'Python\'s heapq is a min-heap. By negating values (-x), the smallest negated value corresponds to the largest original value.' },
    { question: 'What is the time complexity of building a heap from n elements using heapify?', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 1, explanation: 'heapify() builds the heap bottom-up in O(n) — counterintuitively faster than inserting n elements one by one (O(n log n)).' },
    { question: 'To find the Kth largest element efficiently, which heap approach works in O(n log k)?', options: ['Max-heap of all n elements, pop k times', 'Min-heap of size k — push each element, pop if heap exceeds size k', 'Sort and index at k', 'BFS traversal'], answer: 1, explanation: 'A min-heap of size k keeps the k largest elements seen so far. The root is always the kth largest. Total time: O(n log k).' },
    { question: 'What is the time complexity of extracting the minimum from a heap?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, explanation: 'Extraction swaps root with last element, removes it, and sifts down — O(log n).' },
  ],
  questions: [
    {
      number: 39, name: 'Kth Largest Element in an Array', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Heap', 'Sorting', 'Quickselect'],
      leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
      hintContent: `## Hint: Kth Largest Element\n\n**Min-heap of size k:** The root of a min-heap of the k largest elements IS the kth largest.\n\n\`\`\`python\nimport heapq\nheap = []\nfor num in nums:\n    heapq.heappush(heap, num)\n    if len(heap) > k:\n        heapq.heappop(heap)\nreturn heap[0]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why does a min-heap of size k give the kth largest?', level: 'medium' },
        { question: 'Compare min-heap vs. sorting vs. Quickselect for this problem.', level: 'hard' },
        { question: 'What is the average and worst-case time complexity of Quickselect?', level: 'hard' },
        { question: 'How would you find the kth largest in a stream of numbers?', level: 'medium' },
        { question: 'What is the space complexity of the heap approach?', level: 'easy' },
      ],
    },
    {
      number: 40, name: 'Top K Frequent Elements', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Hash Table', 'Heap', 'Sorting'],
      leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
      hintContent: `## Hint: Top K Frequent Elements\n\n**Count then heap:** Build a frequency map, then use a min-heap of size k on (frequency, element) pairs.\n\n\`\`\`python\nfrom collections import Counter\nimport heapq\ncount = Counter(nums)\nreturn heapq.nlargest(k, count.keys(), key=count.get)\n# Or bucket sort for O(n)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of the heap approach?', level: 'easy' },
        { question: 'How does bucket sort achieve O(n) for this problem?', level: 'hard' },
        { question: 'How would you handle ties (elements with equal frequency)?', level: 'medium' },
        { question: 'How would you maintain top K frequent elements in a real-time stream?', level: 'hard' },
        { question: 'Can you solve this without a heap? What is the trade-off?', level: 'medium' },
      ],
    },
    {
      number: 41, name: 'Merge K Sorted Lists', orderInModule: 3, difficulty: 'HARD',
      topics: ['Linked List', 'Heap', 'Divide & Conquer'],
      leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      hintContent: `## Hint: Merge K Sorted Lists\n\n**Min-heap:** Push the head of each list. Pop the min, add to result, push its next node.\n\n\`\`\`python\nimport heapq\nheap = []\nfor i, node in enumerate(lists):\n    if node:\n        heapq.heappush(heap, (node.val, i, node))\ndummy = cur = ListNode(0)\nwhile heap:\n    val, i, node = heapq.heappop(heap)\n    cur.next = node\n    cur = cur.next\n    if node.next:\n        heapq.heappush(heap, (node.next.val, i, node.next))\nreturn dummy.next\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we store the list index alongside the node in the heap?', level: 'medium' },
        { question: 'What is the time complexity: O(N log k) where N is total nodes and k is number of lists?', level: 'medium' },
        { question: 'How does the divide-and-conquer approach compare to the heap approach?', level: 'hard' },
        { question: 'What edge cases must you handle (empty lists, single list)?', level: 'easy' },
        { question: 'How would you merge K sorted arrays instead of linked lists?', level: 'medium' },
      ],
    },
  ],
},
// MODULE 10 — Backtracking
{
  slug: 'backtracking', name: 'Backtracking', order: 10, iconKey: 'backtrack',
  description: 'Explore all possibilities recursively, pruning invalid paths early.',
  introContent: `# Backtracking\n\n## What is Backtracking?\nBacktracking is a systematic method for finding solutions by trying candidates and **abandoning** (backtracking) when they cannot lead to a valid solution.\n\n## Template\n\`\`\`python\ndef backtrack(path, choices):\n    if is_solution(path):\n        results.append(path[:])\n        return\n    for choice in choices:\n        if is_valid(choice, path):\n            path.append(choice)   # make choice\n            backtrack(path, next_choices)\n            path.pop()            # undo choice (backtrack)\n\`\`\`\n\n## Key Patterns\n- **Subsets:** include or exclude each element\n- **Permutations:** try each unused element at each position\n- **Combination Sum:** pick same element multiple times until sum reached\n- **Grid DFS (Word Search):** mark visited, explore 4 directions, unmark\n\n## Pruning\nPruning eliminates branches early. Example: if remaining sum < 0, stop exploring.\n`,
  preliminaryQuestions: [
    { question: 'What is the key operation that defines backtracking?', options: ['Sorting candidates before exploring', 'Undoing a choice after exploring its subtree', 'Using dynamic programming to cache results', 'Exploring only the most promising branch'], answer: 1, explanation: 'Backtracking explores a choice, recurses, then **undoes** that choice so the next option can be explored from the same state.' },
    { question: 'What is the time complexity of generating all subsets of n elements?', options: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)'], answer: 2, explanation: 'Each element is either included or excluded, giving 2ⁿ subsets total.' },
    { question: 'How do you avoid duplicate subsets when the input has duplicate elements?', options: ['Use a set to store results', 'Sort the array and skip duplicate elements at the same recursion level', 'Use memoization', 'Shuffle before backtracking'], answer: 1, explanation: 'Sorting ensures duplicates are adjacent. By skipping an element if it equals its predecessor at the same level, we avoid generating identical subsets.' },
    { question: 'In Word Search, why must you mark a cell as visited before recursing?', options: ['To reduce memory usage', 'To prevent reusing the same cell in a single path', 'To speed up the search', 'To avoid stack overflow'], answer: 1, explanation: 'Without marking visited cells, the same cell could be used multiple times in a single word path, which the problem forbids.' },
    { question: 'What is pruning in the context of backtracking?', options: ['Removing elements from the input array', 'Cutting off a recursive branch early when it cannot lead to a solution', 'Using memoization to skip repeated subproblems', 'Sorting candidates to improve cache performance'], answer: 1, explanation: 'Pruning stops exploration of a branch as soon as we know it cannot yield a valid solution, drastically reducing the search space.' },
  ],
  questions: [
    {
      number: 42, name: 'Subsets', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Backtracking', 'Bit Manipulation'],
      leetcodeUrl: 'https://leetcode.com/problems/subsets/',
      hintContent: `## Hint: Subsets\n\n**Backtrack:** at each index, choose to include or exclude the element.\n\n\`\`\`python\nresults = []\ndef bt(start, path):\n    results.append(path[:])\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        bt(i + 1, path)\n        path.pop()\nbt(0, [])\nreturn results\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Walk through the recursion tree for nums = [1,2,3].', level: 'easy' },
        { question: 'How would you generate subsets using bit manipulation?', level: 'medium' },
        { question: 'How would you handle duplicates in the input?', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you generate only subsets of exactly size k?', level: 'medium' },
      ],
    },
    {
      number: 43, name: 'Permutations', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Backtracking'],
      leetcodeUrl: 'https://leetcode.com/problems/permutations/',
      hintContent: `## Hint: Permutations\n\n**Swap-based:** swap each element to the current position, recurse, swap back.\n\n\`\`\`python\nresults = []\ndef bt(start):\n    if start == len(nums):\n        results.append(nums[:])\n        return\n    for i in range(start, len(nums)):\n        nums[start], nums[i] = nums[i], nums[start]\n        bt(start + 1)\n        nums[start], nums[i] = nums[i], nums[start]\nbt(0)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the time complexity of generating all permutations?', level: 'easy' },
        { question: 'How does the swap-based approach avoid using a visited array?', level: 'medium' },
        { question: 'How would you generate permutations with duplicates (Permutations II)?', level: 'hard' },
        { question: 'How would you find the next permutation in lexicographic order?', level: 'hard' },
        { question: 'How would you generate permutations iteratively?', level: 'medium' },
      ],
    },
    {
      number: 44, name: 'Combination Sum', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Backtracking'],
      leetcodeUrl: 'https://leetcode.com/problems/combination-sum/',
      hintContent: `## Hint: Combination Sum\n\n**Key:** Candidates can be reused. Pass same index i (not i+1) when recursing.\n\n\`\`\`python\nresults = []\ndef bt(start, path, remaining):\n    if remaining == 0:\n        results.append(path[:]); return\n    for i in range(start, len(candidates)):\n        if candidates[i] > remaining: break\n        path.append(candidates[i])\n        bt(i, path, remaining - candidates[i])  # i not i+1\n        path.pop()\ncandidates.sort()\nbt(0, [], target)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we pass i instead of i+1 when a candidate can be reused?', level: 'easy' },
        { question: 'How does sorting and breaking early prune the search space?', level: 'medium' },
        { question: 'How would you modify this for Combination Sum II (each element used once)?', level: 'medium' },
        { question: 'What is the time complexity in the worst case?', level: 'hard' },
        { question: 'How would you count (not enumerate) valid combinations — could DP help?', level: 'hard' },
      ],
    },
    {
      number: 45, name: 'Word Search', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Backtracking', 'Matrix', 'DFS'],
      leetcodeUrl: 'https://leetcode.com/problems/word-search/',
      hintContent: `## Hint: Word Search\n\n**DFS + backtrack:** at each cell, if it matches word[i], mark visited and explore 4 directions for word[i+1].\n\n\`\`\`python\ndef dfs(r, c, i):\n    if i == len(word): return True\n    if not (0<=r<rows and 0<=c<cols) or board[r][c] != word[i]: return False\n    tmp, board[r][c] = board[r][c], '#'  # mark visited\n    found = any(dfs(r+dr, c+dc, i+1) for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)])\n    board[r][c] = tmp  # unmark\n    return found\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we temporarily mark a cell as visited during DFS?', level: 'easy' },
        { question: 'What is the time complexity in the worst case?', level: 'medium' },
        { question: 'How would you find ALL occurrences of the word, not just one?', level: 'medium' },
        { question: 'How would Trie-based pruning help if we need to find multiple words (Word Search II)?', level: 'hard' },
        { question: 'How would you parallelize this search on a very large board?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 11 — Dynamic Programming
{
  slug: 'dynamic-programming', name: 'Dynamic Programming', order: 11, iconKey: 'dp',
  description: 'Break problems into overlapping subproblems and cache results to avoid recomputation.',
  introContent: `# Dynamic Programming\n\n## Core Idea\nDP solves problems by combining solutions to **overlapping subproblems**, storing results to avoid recomputation (memoization or tabulation).\n\n## Two Approaches\n- **Top-down (memoization):** Recursive + cache\n- **Bottom-up (tabulation):** Fill a table iteratively\n\n## Identifying DP Problems\n- Optimal substructure: optimal solution built from optimal subsolutions\n- Overlapping subproblems: same subproblems solved repeatedly\n\n## Common Patterns\n\`\`\`python\n# 1D DP — Climbing Stairs\ndp[i] = dp[i-1] + dp[i-2]\n\n# 1D DP — House Robber\ndp[i] = max(dp[i-1], dp[i-2] + nums[i])\n\n# Coin Change (unbounded knapsack)\ndp[i] = min(dp[i], dp[i - coin] + 1) for each coin\n\n# LCS — 2D DP\nif s1[i] == s2[j]: dp[i][j] = dp[i-1][j-1] + 1\nelse: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n\`\`\`\n`,
  preliminaryQuestions: [
    { question: 'What are the two key properties that identify a dynamic programming problem?', options: ['Greedy choice and global optimum', 'Optimal substructure and overlapping subproblems', 'Divide and conquer with no overlap', 'Graph connectivity and path existence'], answer: 1, explanation: 'DP requires optimal substructure (optimal solution uses optimal subsolutions) and overlapping subproblems (same subproblems recur).' },
    { question: 'What is memoization?', options: ['Sorting subproblems before solving', 'Caching the results of recursive calls to avoid recomputation', 'Solving subproblems in a specific bottom-up order', 'Using extra memory to store the input'], answer: 1, explanation: 'Memoization stores the result of each subproblem the first time it is solved, returning the cached result on subsequent calls.' },
    { question: 'In the Coin Change problem, what does dp[i] represent?', options: ['The i-th coin denomination', 'The minimum number of coins to make amount i', 'Whether amount i is achievable', 'The number of ways to make amount i'], answer: 1, explanation: 'dp[i] = minimum number of coins needed to make amount i. We try each coin and take the minimum over all valid choices.' },
    { question: 'What is the recurrence for Longest Common Subsequence of s1 and s2?', options: ['dp[i][j] = dp[i-1][j-1] + 1 always', 'dp[i][j] = dp[i-1][j-1]+1 if s1[i]==s2[j], else max(dp[i-1][j], dp[i][j-1])', 'dp[i][j] = min(dp[i-1][j], dp[i][j-1])', 'dp[i][j] = dp[i-1][j-1] * 2'], answer: 1, explanation: 'When characters match, extend the LCS. Otherwise, take the best of skipping one character from either string.' },
    { question: 'How does the space-optimized House Robber solution work?', options: ['Use a 2D array', 'Keep only two variables: previous two dp values', 'Use a stack to track states', 'Memoize with a hash map'], answer: 1, explanation: 'Since dp[i] only depends on dp[i-1] and dp[i-2], we can replace the full dp array with two rolling variables, reducing space to O(1).' },
  ],
  questions: [
    {
      number: 46, name: 'Climbing Stairs', orderInModule: 1, difficulty: 'EASY',
      topics: ['Dynamic Programming', 'Math', 'Memoization'],
      leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
      hintContent: `## Hint: Climbing Stairs\n\n**Key Insight:** To reach step n, you came from step n-1 or n-2. It's Fibonacci!\n\n\`\`\`python\nif n <= 2: return n\na, b = 1, 2\nfor _ in range(3, n + 1):\n    a, b = b, a + b\nreturn b\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is this problem equivalent to Fibonacci?', level: 'easy' },
        { question: 'What is the time and space complexity of the O(1) space solution?', level: 'easy' },
        { question: 'How would you generalize to k-step jumps?', level: 'medium' },
        { question: 'How would you solve this with matrix exponentiation in O(log n)?', level: 'hard' },
        { question: 'How would you count paths if some steps are blocked?', level: 'medium' },
      ],
    },
    {
      number: 47, name: 'House Robber', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Dynamic Programming'],
      leetcodeUrl: 'https://leetcode.com/problems/house-robber/',
      hintContent: `## Hint: House Robber\n\n**At each house:** rob it (prev_prev + current) or skip it (prev).\n\n\`\`\`python\nprev2, prev1 = 0, 0\nfor num in nums:\n    prev2, prev1 = prev1, max(prev1, prev2 + num)\nreturn prev1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What does the state dp[i] represent?', level: 'easy' },
        { question: 'Why can\'t we rob adjacent houses?', level: 'easy' },
        { question: 'How would you solve House Robber II (circular array)?', level: 'medium' },
        { question: 'How would you solve House Robber III (binary tree)?', level: 'hard' },
        { question: 'What is the space-optimized time and space complexity?', level: 'easy' },
      ],
    },
    {
      number: 48, name: 'Coin Change', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Dynamic Programming', 'BFS'],
      leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
      hintContent: `## Hint: Coin Change\n\n**Bottom-up DP:** dp[i] = min coins to make amount i.\n\n\`\`\`python\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor i in range(1, amount + 1):\n    for coin in coins:\n        if coin <= i:\n            dp[i] = min(dp[i], dp[i - coin] + 1)\nreturn dp[amount] if dp[amount] != float('inf') else -1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is greedy (always pick the largest coin) not always correct?', level: 'medium' },
        { question: 'What is the time complexity? O(amount * len(coins))', level: 'easy' },
        { question: 'How would you count the number of ways (not minimum) to make the amount?', level: 'medium' },
        { question: 'How does BFS also solve this problem?', level: 'hard' },
        { question: 'How would you reconstruct which coins were used?', level: 'medium' },
      ],
    },
    {
      number: 49, name: 'Longest Increasing Subsequence', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Dynamic Programming', 'Binary Search'],
      leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
      hintContent: `## Hint: LIS\n\n**O(n log n) — patience sorting:** Maintain a "tails" array. For each num, binary search for its position.\n\n\`\`\`python\nimport bisect\ntails = []\nfor num in nums:\n    pos = bisect.bisect_left(tails, num)\n    if pos == len(tails): tails.append(num)\n    else: tails[pos] = num\nreturn len(tails)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Explain the O(n²) DP approach first, then the O(n log n) optimization.', level: 'medium' },
        { question: 'What does the tails array represent in the patience sorting approach?', level: 'hard' },
        { question: 'How would you reconstruct the actual subsequence?', level: 'hard' },
        { question: 'How would you find the LIS in a 2D array (Russian Doll Envelopes)?', level: 'hard' },
        { question: 'What is the difference between LIS and Longest Common Subsequence?', level: 'medium' },
      ],
    },
    {
      number: 50, name: 'Longest Common Subsequence', orderInModule: 5, difficulty: 'MEDIUM',
      topics: ['Strings', 'Dynamic Programming'],
      leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
      hintContent: `## Hint: LCS\n\n**2D DP:** if chars match, extend diagonal; else take max of left or above.\n\n\`\`\`python\nm, n = len(text1), len(text2)\ndp = [[0]*(n+1) for _ in range(m+1)]\nfor i in range(1, m+1):\n    for j in range(1, n+1):\n        if text1[i-1] == text2[j-1]:\n            dp[i][j] = dp[i-1][j-1] + 1\n        else:\n            dp[i][j] = max(dp[i-1][j], dp[i][j-1])\nreturn dp[m][n]\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What is the recurrence relation and its intuition?', level: 'medium' },
        { question: 'What is the time and space complexity? Can space be reduced to O(n)?', level: 'medium' },
        { question: 'How does LCS relate to the Edit Distance problem?', level: 'hard' },
        { question: 'How would you reconstruct the actual LCS string?', level: 'medium' },
        { question: 'How would you find the Shortest Common Supersequence using LCS?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 12 — Greedy
{
  slug: 'greedy', name: 'Greedy', order: 12, iconKey: 'greedy',
  description: 'Make locally optimal choices at each step to achieve a globally optimal solution.',
  introContent: `# Greedy Algorithms\n\n## What is Greedy?\nA greedy algorithm makes the **locally optimal choice** at each step, hoping it leads to the global optimum. Unlike DP, it never reconsiders choices.\n\n## When Does Greedy Work?\nGreedy works when the problem has the **greedy choice property**: a locally optimal choice is part of some globally optimal solution.\n\n## Common Greedy Problems\n- **Jump Game:** Can you reach the end? Track max reachable index.\n- **Gas Station:** Sum of (gas - cost) must be ≥ 0; start where running sum goes negative.\n- **Partition Labels:** For each char, track its last occurrence; expand window to cover it.\n\n## Key Insight\nGreedy often requires sorting first, then making a decision based on the sorted order.\n`,
  preliminaryQuestions: [
    { question: 'What is the greedy choice property?', options: ['The problem can be divided into independent subproblems', 'A locally optimal choice is always part of some globally optimal solution', 'The problem has overlapping subproblems', 'The input must be sorted first'], answer: 1, explanation: 'Greedy algorithms rely on the greedy choice property: making the locally best decision at each step leads to a globally optimal solution.' },
    { question: 'In Jump Game, what does tracking the "max reachable index" allow you to do?', options: ['Sort the jumps by length', 'Determine if any position can reach the end without exhaustive search', 'Build a DP table', 'Find the minimum number of jumps'], answer: 1, explanation: 'By tracking how far right you can reach at each step, you can determine in O(n) whether the end is reachable.' },
    { question: 'What is the key observation in the Gas Station problem?', options: ['Start at the station with the most gas', 'If total gas >= total cost, a solution exists; start where running sum first goes negative', 'Sort stations by gas amount', 'Use binary search on the starting station'], answer: 1, explanation: 'If sum(gas) >= sum(cost), a solution exists. The starting point is just after wherever the cumulative sum dips below zero.' },
    { question: 'Greedy vs DP: when should you prefer DP?', options: ['When you need O(1) space', 'When local choices may not lead to global optimum and subproblems overlap', 'When the input is already sorted', 'When the problem has a unique solution'], answer: 1, explanation: 'Use DP when greedy cannot guarantee optimality — specifically, when the locally best choice at one step might block a better overall solution.' },
    { question: 'In Partition Labels, why do we track the last occurrence of each character?', options: ['To sort characters alphabetically', 'To know the minimum window that must contain all occurrences of a character', 'To count character frequencies', 'To detect duplicates'], answer: 1, explanation: 'Each partition must contain all occurrences of every character in it. Tracking the last occurrence of each char tells us the earliest point the partition can end.' },
  ],
  questions: [
    {
      number: 51, name: 'Jump Game', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Greedy', 'Dynamic Programming'],
      leetcodeUrl: 'https://leetcode.com/problems/jump-game/',
      hintContent: `## Hint: Jump Game\n\n**Track max reachable index:** If current index exceeds max_reach, you're stuck.\n\n\`\`\`python\nmax_reach = 0\nfor i, jump in enumerate(nums):\n    if i > max_reach: return False\n    max_reach = max(max_reach, i + jump)\nreturn True\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'What does max_reach represent at each step?', level: 'easy' },
        { question: 'Why does i > max_reach mean we cannot proceed?', level: 'easy' },
        { question: 'How would you find the minimum number of jumps to reach the end (Jump Game II)?', level: 'medium' },
        { question: 'How would you handle negative jump values?', level: 'medium' },
        { question: 'Can this be solved with DP? Compare the two approaches.', level: 'medium' },
      ],
    },
    {
      number: 52, name: 'Gas Station', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Greedy'],
      leetcodeUrl: 'https://leetcode.com/problems/gas-station/',
      hintContent: `## Hint: Gas Station\n\n**Key insight:** If total gas >= total cost, a solution exists. Reset start position whenever tank goes negative.\n\n\`\`\`python\ntotal = tank = start = 0\nfor i in range(len(gas)):\n    diff = gas[i] - cost[i]\n    tank += diff\n    total += diff\n    if tank < 0:\n        start = i + 1\n        tank = 0\nreturn start if total >= 0 else -1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is there always a unique solution if one exists?', level: 'medium' },
        { question: 'Prove that resetting start to i+1 when tank<0 is correct.', level: 'hard' },
        { question: 'What is the time complexity?', level: 'easy' },
        { question: 'How would you solve this if multiple valid starting points exist?', level: 'hard' },
        { question: 'How would you handle a linear (non-circular) version of this problem?', level: 'medium' },
      ],
    },
    {
      number: 53, name: 'Partition Labels', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Strings', 'Greedy', 'Two Pointers'],
      leetcodeUrl: 'https://leetcode.com/problems/partition-labels/',
      hintContent: `## Hint: Partition Labels\n\n**Track last occurrence of each char, then greedily expand the current partition.**\n\n\`\`\`python\nlast = {ch: i for i, ch in enumerate(s)}\nresult = []\nstart = end = 0\nfor i, ch in enumerate(s):\n    end = max(end, last[ch])\n    if i == end:\n        result.append(end - start + 1)\n        start = i + 1\nreturn result\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why must a partition extend to the last occurrence of every character in it?', level: 'easy' },
        { question: 'Walk through the algorithm with s = "ababcbaca".', level: 'medium' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you maximize the number of partitions while keeping all same chars in one part?', level: 'medium' },
        { question: 'How would you handle the case where characters can appear in multiple partitions?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 13 — Graphs
{
  slug: 'graphs', name: 'Graphs', order: 13, iconKey: 'graph',
  description: 'Traverse and analyze graphs using BFS, DFS, and topological sort.',
  introContent: `# Graphs\n\n## Graph Representations\n- **Adjacency list:** dict/array of neighbor lists — O(V+E) space\n- **Adjacency matrix:** 2D array — O(V²) space\n- **Grid:** implicit graph where cells are nodes, edges are 4-directional moves\n\n## DFS Template\n\`\`\`python\nvisited = set()\ndef dfs(node):\n    visited.add(node)\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            dfs(neighbor)\n\`\`\`\n\n## BFS Template\n\`\`\`python\nfrom collections import deque\nqueue = deque([start])\nvisited = {start}\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)\n\`\`\`\n\n## Topological Sort (Kahn's Algorithm)\n1. Compute in-degrees for all nodes\n2. Enqueue nodes with in-degree 0\n3. Process: decrement neighbors' in-degrees, enqueue if 0\n4. If processed count < total nodes → cycle exists\n`,
  preliminaryQuestions: [
    { question: 'What is the time complexity of BFS/DFS on a graph with V vertices and E edges?', options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'], answer: 2, explanation: 'BFS/DFS visits each vertex once and each edge once, giving O(V + E) time.' },
    { question: 'In a grid problem, how do you represent the graph implicitly?', options: ['Build an adjacency list from all cells', 'Treat each cell as a node; edges connect cells in 4 directions', 'Use Union-Find for each cell', 'Sort cells by value first'], answer: 1, explanation: 'Grid problems use an implicit graph: cells are nodes, and valid horizontal/vertical moves are edges.' },
    { question: 'What does topological sort produce?', options: ['Shortest path between two nodes', 'A linear ordering of nodes where every directed edge goes from earlier to later', 'All cycles in a directed graph', 'The minimum spanning tree'], answer: 1, explanation: 'Topological sort orders nodes so that for every directed edge u→v, u appears before v. Only possible on DAGs (no cycles).' },
    { question: 'How does Kahn\'s algorithm detect a cycle in a directed graph?', options: ['If DFS stack overflows', 'If the topological order contains fewer nodes than total nodes', 'If BFS visits a node twice', 'If the adjacency matrix has a non-zero diagonal'], answer: 1, explanation: 'If a cycle exists, the nodes in the cycle never reach in-degree 0 and are never enqueued, so the processed count < total nodes.' },
    { question: 'What data structure does BFS use and why?', options: ['Stack — for LIFO processing', 'Queue — for FIFO processing to explore level by level', 'Heap — to prioritize by distance', 'Hash map — to track predecessors'], answer: 1, explanation: 'BFS uses a queue (FIFO) to explore all nodes at the current distance before moving to the next distance level.' },
  ],
  questions: [
    {
      number: 54, name: 'Number of Islands', orderInModule: 1, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Matrix', 'BFS', 'DFS', 'Union Find'],
      leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
      hintContent: `## Hint: Number of Islands\n\n**DFS flood fill:** when you find a '1', increment count and DFS to mark the entire island as visited.\n\n\`\`\`python\ndef dfs(r, c):\n    if not (0<=r<rows and 0<=c<cols) or grid[r][c] != '1': return\n    grid[r][c] = '0'  # mark visited\n    for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:\n        dfs(r+dr, c+dc)\n\ncount = 0\nfor r in range(rows):\n    for c in range(cols):\n        if grid[r][c] == '1':\n            dfs(r, c); count += 1\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we mark cells as "0" during DFS?', level: 'easy' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you solve this with Union-Find?', level: 'hard' },
        { question: 'How would you count islands in a stream (cells added dynamically)?', level: 'hard' },
        { question: 'How would you find the largest island?', level: 'medium' },
      ],
    },
    {
      number: 55, name: 'Clone Graph', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Graphs', 'BFS', 'DFS', 'Hash Table'],
      leetcodeUrl: 'https://leetcode.com/problems/clone-graph/',
      hintContent: `## Hint: Clone Graph\n\n**DFS with a hash map:** map original node → clone. If already cloned, return the clone.\n\n\`\`\`python\ncloned = {}\ndef dfs(node):\n    if node in cloned: return cloned[node]\n    clone = Node(node.val)\n    cloned[node] = clone\n    for neighbor in node.neighbors:\n        clone.neighbors.append(dfs(neighbor))\n    return clone\nreturn dfs(node) if node else None\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we check if a node is already cloned before creating a new clone?', level: 'easy' },
        { question: 'What would happen without the hash map (infinite loop)?', level: 'medium' },
        { question: 'How would you clone an undirected graph iteratively using BFS?', level: 'medium' },
        { question: 'How would you deep-copy a general object graph with cycles?', level: 'hard' },
        { question: 'What is the time and space complexity?', level: 'easy' },
      ],
    },
    {
      number: 56, name: 'Course Schedule', orderInModule: 3, difficulty: 'MEDIUM',
      topics: ['Graphs', 'BFS', 'DFS', 'Topological Sort'],
      leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
      hintContent: `## Hint: Course Schedule\n\n**Cycle detection via Kahn's topological sort:**\n\n\`\`\`python\nfrom collections import deque, defaultdict\nin_degree = [0] * numCourses\ngraph = defaultdict(list)\nfor a, b in prerequisites:\n    graph[b].append(a)\n    in_degree[a] += 1\nqueue = deque(c for c in range(numCourses) if in_degree[c] == 0)\ncount = 0\nwhile queue:\n    node = queue.popleft(); count += 1\n    for neighbor in graph[node]:\n        in_degree[neighbor] -= 1\n        if in_degree[neighbor] == 0: queue.append(neighbor)\nreturn count == numCourses\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why does a cycle make it impossible to complete all courses?', level: 'easy' },
        { question: 'How does checking count == numCourses detect a cycle?', level: 'medium' },
        { question: 'How would you also return the course order (Course Schedule II)?', level: 'medium' },
        { question: 'How would you detect cycles using DFS with state coloring (white/gray/black)?', level: 'hard' },
        { question: 'What is the time complexity of Kahn\'s algorithm?', level: 'easy' },
      ],
    },
    {
      number: 57, name: 'Pacific Atlantic Water Flow', orderInModule: 4, difficulty: 'MEDIUM',
      topics: ['Arrays', 'Matrix', 'BFS', 'DFS'],
      leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
      hintContent: `## Hint: Pacific Atlantic Water Flow\n\n**Reverse BFS:** instead of flowing down, BFS upward from each ocean's border cells.\n\n\`\`\`python\ndef bfs(starts):\n    visited = set(starts)\n    queue = deque(starts)\n    while queue:\n        r, c = queue.popleft()\n        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:\n            nr, nc = r+dr, c+dc\n            if (nr,nc) not in visited and 0<=nr<rows and 0<=nc<cols and heights[nr][nc] >= heights[r][c]:\n                visited.add((nr,nc)); queue.append((nr,nc))\n    return visited\npacific = bfs([(r,0) for r in range(rows)] + [(0,c) for c in range(cols)])\natlantic = bfs([(r,cols-1) for r in range(rows)] + [(rows-1,c) for c in range(cols)])\nreturn list(pacific & atlantic)\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why do we BFS from the ocean borders instead of from each cell?', level: 'medium' },
        { question: 'Why do we check heights[nr][nc] >= heights[r][c] (reversed condition)?', level: 'medium' },
        { question: 'What is the time complexity?', level: 'easy' },
        { question: 'How would you handle this if water can also flow diagonally?', level: 'medium' },
        { question: 'How would you solve this for three or more oceans?', level: 'hard' },
      ],
    },
  ],
},
// MODULE 14 — Misc / Advanced
{
  slug: 'misc-advanced', name: 'Misc / Advanced', order: 14, iconKey: 'misc',
  description: 'Bit manipulation tricks and advanced design problems like LRU Cache.',
  introContent: `# Misc / Advanced\n\n## Bit Manipulation\nBit operations work on integer bits directly — extremely fast.\n\n| Operation | Trick |\n|-----------|-------|\n| XOR with self | n ^ n = 0 |\n| XOR with 0 | n ^ 0 = n |\n| Check bit i | n & (1 << i) |\n| Set bit i | n \\| (1 << i) |\n| Clear bit i | n & ~(1 << i) |\n\n**Single Number:** XOR all elements — duplicates cancel, leaving the unique one.\n\n## LRU Cache Design\nLRU (Least Recently Used) evicts the item not used for the longest time.\n\n**Optimal implementation:** Hash map + Doubly Linked List\n- Hash map: O(1) key lookup → node pointer\n- DLL: O(1) move node to front (most recent), remove from tail (least recent)\n\n\`\`\`python\n# On get: move node to front\n# On put: add to front; if over capacity, remove tail\n\`\`\`\n`,
  preliminaryQuestions: [
    { question: 'What is the result of XORing a number with itself?', options: ['The number doubled', '0', 'The number unchanged', 'The number negated'], answer: 1, explanation: 'n XOR n = 0 for any n. Each bit cancels itself: 0^0=0, 1^1=0.' },
    { question: 'Why does XOR find the single unique number in an array where all others appear twice?', options: ['XOR adds numbers together', 'Pairs cancel (n^n=0) and 0^unique = unique remains', 'XOR computes the sum modulo 2', 'XOR sorts the array'], answer: 1, explanation: 'XOR is commutative and associative. All pairs cancel to 0, and 0 XOR unique_number = unique_number.' },
    { question: 'What data structures make LRU Cache O(1) for both get and put?', options: ['Array + Binary Search', 'Hash Map + Doubly Linked List', 'Balanced BST', 'Stack + Hash Set'], answer: 1, explanation: 'A hash map maps keys to DLL nodes (O(1) lookup). The DLL allows O(1) insertion/deletion at any position given a node pointer.' },
    { question: 'In LRU Cache, what does "least recently used" mean for eviction?', options: ['The item with the lowest key value', 'The item that was accessed or inserted furthest in the past', 'The item added first', 'A random item'], answer: 1, explanation: 'LRU evicts the item that has not been accessed for the longest time — the one at the tail of the doubly linked list.' },
    { question: 'How do you check if bit i of integer n is set?', options: ['n >> i', 'n & (1 << i)', 'n | (1 << i)', 'n ^ (1 << i)'], answer: 1, explanation: '1 << i creates a mask with only bit i set. ANDing with n isolates that bit — the result is non-zero if bit i is set.' },
  ],
  questions: [
    {
      number: 58, name: 'Single Number', orderInModule: 1, difficulty: 'EASY',
      topics: ['Arrays', 'Bit Manipulation'],
      leetcodeUrl: 'https://leetcode.com/problems/single-number/',
      hintContent: `## Hint: Single Number\n\n**XOR all elements:** duplicates cancel to 0, unique number remains.\n\n\`\`\`python\nresult = 0\nfor num in nums:\n    result ^= num\nreturn result\n\`\`\`\n\nTime: O(n), Space: O(1)\n`,
      interviewQuestions: [
        { question: 'Explain why XOR of all elements gives the unique number.', level: 'easy' },
        { question: 'What is the time and space complexity?', level: 'easy' },
        { question: 'How would you find the single number if all others appear three times (not two)?', level: 'hard' },
        { question: 'How would you find two unique numbers if all others appear twice?', level: 'hard' },
        { question: 'How would you solve this without using bit manipulation?', level: 'medium' },
      ],
    },
    {
      number: 59, name: 'LRU Cache', orderInModule: 2, difficulty: 'MEDIUM',
      topics: ['Design', 'Hash Table', 'Linked List', 'Doubly-Linked List'],
      leetcodeUrl: 'https://leetcode.com/problems/lru-cache/',
      hintContent: `## Hint: LRU Cache\n\n**Hash map + Doubly Linked List.** Head = most recent, Tail = least recent.\n\n\`\`\`python\nclass Node:\n    def __init__(self, k=0, v=0):\n        self.key, self.val = k, v\n        self.prev = self.next = None\n# Maintain dummy head and tail\n# get: move node to head\n# put: add to head; if over capacity, remove tail node\n\`\`\`\n`,
      interviewQuestions: [
        { question: 'Why is a doubly linked list needed (not singly linked)?', level: 'medium' },
        { question: 'Explain how dummy head and tail simplify the implementation.', level: 'medium' },
        { question: 'What is the time complexity of get and put? Why O(1)?', level: 'easy' },
        { question: 'How would you implement LFU (Least Frequently Used) Cache?', level: 'hard' },
        { question: 'In Python, how does OrderedDict simplify LRU Cache implementation?', level: 'medium' },
      ],
    },
  ],
},
]; // end modules array

// ─── Main seed function ───────────────────────────────────────────────────────
async function main() {
  console.log('Seeding database...');

  // Clear in dependency order
  await prisma.interviewSession.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.moduleProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.module.deleteMany();

  for (const mod of modules) {
    const { questions, preliminaryQuestions, ...moduleData } = mod;

    const createdModule = await prisma.module.create({
      data: { ...moduleData, preliminaryQuestions: preliminaryQuestions as any },
    });

    console.log(`  ✓ Module: ${createdModule.name}`);

    for (const q of questions) {
      const { interviewQuestions, ...questionData } = q;
      await prisma.question.create({
        data: { ...questionData, moduleId: createdModule.id, interviewQuestions: interviewQuestions as any },
      });
      console.log(`    - ${q.name} [${q.difficulty}]`);
    }
  }

  console.log('\nSeed complete! 14 modules, 59 questions.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
