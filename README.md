# UI2

> Unified Intent Interface

## What is it?

A framework for creating a Unified Intent Interface (UI2).

It all revolves around a single textbox, which essentially is able to control an entire application, including searching, taking action, and more.

It allows you to, in live-time, detect user intent as they are typing in that textbox and present a preview of whatever action or query they are taking.

Then, should they want to actually take the action, they can easily confirm the changes.

## Philosophy

Search, taking action, and everything else you can do on an application should not be separate interfaces, but rather unified into one.

The reason why they have always been separated is because there has never been a way to identify a user's Intent—fast enough, and accurate enough—to merge all the experiences into one. But in today's world of LLMs, this is now possible.

But not only that, UI2 enables the idea of instant intent detection. What if as you are typing, what is autocompleted is not _words_, but rather _actions_?

Powered by Cerebras Instant Inference API, you are now able to see the impacts of your actions in a "preview-before-comitting" style—in other words, an adaptive UI that changes around you depending on your intent.

## Use Cases for UI2

UI2 is best suited for cases where there are already multiple textboxes that do multiple actions, and that can benefit from a "preview-before-committing" pipeline.

For example, in a Reminder app, one can do the following actions:

- Create a reminder
- Edit a reminder
- Search for reminders

In this case, through UI2, a single textbox is enough to do all of the tasks.

But at the same time, UI2 can also be used for other "preview-before-committing" tasks such as:

- A unified interface for database management
  - "Delete all inactive users"
  - "Merge duplicate customer records"

## Naming

UI2 stands for the Unified Intent Interface.

However, the naming also implies the "Second-Generation" of UI.

You should solely refer to the project as UI2 or ui2 and not in other forms, like "UII", "UI Two", and so on.

## Install

```bash
npm i ui2.js
```
